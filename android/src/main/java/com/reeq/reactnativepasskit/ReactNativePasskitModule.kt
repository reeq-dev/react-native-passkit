package com.reeq.reactnativepasskit

import android.app.Activity
import android.content.Intent
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.pay.Pay
import com.google.android.gms.pay.PayApiAvailabilityStatus
import com.google.android.gms.pay.PayClient
import org.json.JSONException
import org.json.JSONObject

class ReactNativePasskitModule(private val reactContext: ReactApplicationContext) :
  NativeReactNativePasskitSpec(reactContext), LifecycleEventListener {

  private var listenerCount = 0

  /**
   * True while a Google Wallet save flow we started is on screen. Mirrors the
   * iOS guard so a second call rejects instead of stacking another flow.
   */
  private var saveInProgress = false

  /**
   * Created lazily so the module works before the first `onHostResume`. The
   * application context is enough for availability checks; saving passes
   * still needs the current Activity (passed explicitly to `savePasses`).
   */
  private val walletClient: PayClient by lazy { Pay.getClient(reactContext.applicationContext) }

  private val activityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
      ) {
        if (requestCode != ADD_TO_GOOGLE_WALLET_REQUEST_CODE) return
        saveInProgress = false

        val event = Arguments.createMap()
        when (resultCode) {
          Activity.RESULT_OK -> event.putString(KEY_STATUS, STATUS_SUCCESS)

          Activity.RESULT_CANCELED -> event.putString(KEY_STATUS, STATUS_CANCELLED)

          PayClient.SavePassesResult.SAVE_ERROR -> {
            event.putString(KEY_STATUS, STATUS_ERROR)
            event.putString(KEY_ERROR_TYPE, ERROR_TYPE_API)
            data?.getStringExtra(PayClient.EXTRA_API_ERROR_MESSAGE)?.let {
              event.putString(KEY_MESSAGE, it)
            }
          }

          PayClient.SavePassesResult.API_UNAVAILABLE -> {
            event.putString(KEY_STATUS, STATUS_ERROR)
            event.putString(KEY_ERROR_TYPE, ERROR_TYPE_UNAVAILABLE)
          }

          PayClient.SavePassesResult.INTERNAL_ERROR -> {
            event.putString(KEY_STATUS, STATUS_ERROR)
            event.putString(KEY_ERROR_TYPE, ERROR_TYPE_INTERNAL)
          }

          else -> {
            event.putString(KEY_STATUS, STATUS_ERROR)
            event.putString(KEY_ERROR_TYPE, ERROR_TYPE_UNEXPECTED)
          }
        }
        emit(EVENT_ADD_PASS_RESULT, event)
      }
    }

  init {
    reactContext.addActivityEventListener(activityEventListener)
    reactContext.addLifecycleEventListener(this)
  }

  override fun invalidate() {
    reactContext.removeActivityEventListener(activityEventListener)
    reactContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  // Our Activity is paused while Google Wallet is on top and its result is
  // delivered before onResume. Reaching onResume with the flag still set means
  // the result was lost (e.g. the Activity was recreated), so don't stay stuck.
  override fun onHostResume() {
    saveInProgress = false
  }

  override fun onHostPause() {}

  override fun onHostDestroy() {}

  // ---- Cross-platform ----

  override fun canAddPasses(format: String, promise: Promise) {
    val requestType =
      if (format == FORMAT_JWT) PayClient.RequestType.SAVE_PASSES_JWT
      else PayClient.RequestType.SAVE_PASSES

    try {
      walletClient
        .getPayApiAvailabilityStatus(requestType)
        .addOnSuccessListener { status ->
          promise.resolve(status == PayApiAvailabilityStatus.AVAILABLE)
        }
        .addOnFailureListener { promise.resolve(false) }
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  override fun addPass(base64EncodedPass: String, promise: Promise) {
    val pass =
      try {
        Base64.decode(base64EncodedPass, Base64.DEFAULT).toString(Charsets.UTF_8)
      } catch (e: IllegalArgumentException) {
        promise.reject(E_DECODE, "Can not decode base64 data", e)
        return
      }

    // Fail fast like iOS does for an invalid .pkpass, instead of launching
    // Google Wallet with a payload it can only reject.
    try {
      JSONObject(pass)
    } catch (e: JSONException) {
      promise.reject(E_PASS, "Can not read pass, expected a Google Wallet JSON payload", e)
      return
    }

    launchSave(promise) { activity ->
      walletClient.savePasses(pass, activity, ADD_TO_GOOGLE_WALLET_REQUEST_CODE)
    }
  }

  override fun addPasses(base64EncodedPasses: ReadableArray, promise: Promise) {
    when (base64EncodedPasses.size()) {
      0 -> promise.reject(E_PASS, "No passes provided")
      1 -> addPass(base64EncodedPasses.getString(0) ?: "", promise)
      else ->
        promise.reject(
          E_PASS,
          "Google Wallet saves multiple passes from a single JSON payload. " +
            "Put all objects into one JSON and pass a single entry.",
        )
    }
  }

  override fun addPassJWT(passJWT: String, promise: Promise) {
    launchSave(promise) { activity ->
      walletClient.savePassesJwt(passJWT, activity, ADD_TO_GOOGLE_WALLET_REQUEST_CODE)
    }
  }

  /** Starts a Google Wallet save flow from the current Activity. */
  private fun launchSave(promise: Promise, launch: (Activity) -> Unit) {
    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.reject(E_NO_ACTIVITY, "No current Activity to present Google Wallet from")
      return
    }
    if (saveInProgress) {
      promise.reject(E_PRESENTATION, "A Google Wallet save flow is already open")
      return
    }

    try {
      saveInProgress = true
      launch(activity)
      promise.resolve(null)
    } catch (e: Exception) {
      saveInProgress = false
      promise.reject(E_SAVE, e.message ?: "Can not save the pass", e)
    }
  }

  override fun getWalletName(promise: Promise) {
    val name =
      try {
        when (walletClient.productName) {
          PayClient.ProductName.GOOGLE_PAY -> "Google Pay"
          else -> "Google Wallet"
        }
      } catch (e: Exception) {
        "Google Wallet"
      }
    promise.resolve(name)
  }

  // ---- iOS only (Apple Wallet pass library). Google Wallet has no on-device
  // pass library API; passes are managed server side via the Google Wallet
  // REST API. ----

  override fun isPassLibraryAvailable(promise: Promise) = promise.resolve(false)

  override fun containsPass(base64EncodedPass: String, promise: Promise) = promise.resolve(false)

  override fun getPasses(promise: Promise) = promise.resolve(Arguments.createArray())

  override fun getPass(passTypeIdentifier: String, serialNumber: String, promise: Promise) =
    promise.resolve(null)

  override fun getPassFieldValue(
    passTypeIdentifier: String,
    serialNumber: String,
    fieldKey: String,
    promise: Promise,
  ) = promise.resolve(null)

  override fun replacePass(base64EncodedPass: String, promise: Promise) =
    unsupported("replacePass", promise)

  override fun removePass(passTypeIdentifier: String, serialNumber: String, promise: Promise) =
    unsupported("removePass", promise)

  override fun openPass(passTypeIdentifier: String, serialNumber: String, promise: Promise) =
    unsupported("openPass", promise)

  // ---- Events ----

  override fun addListener(eventName: String) {
    listenerCount += 1
  }

  override fun removeListeners(count: Double) {
    listenerCount = maxOf(0, listenerCount - count.toInt())
  }

  private fun unsupported(method: String, promise: Promise) {
    promise.reject(E_UNSUPPORTED_PLATFORM, "$method is not supported on android.")
  }

  private fun emit(name: String, params: WritableMap) {
    if (!reactContext.hasActiveReactInstance()) return
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, params)
  }

  companion object {
    const val NAME = NativeReactNativePasskitSpec.NAME

    private const val ADD_TO_GOOGLE_WALLET_REQUEST_CODE = 1000
    private const val EVENT_ADD_PASS_RESULT = "addPassResult"

    private const val FORMAT_JWT = "jwt"

    private const val KEY_STATUS = "status"
    private const val KEY_ERROR_TYPE = "errorType"
    private const val KEY_MESSAGE = "message"

    private const val STATUS_SUCCESS = "success"
    private const val STATUS_CANCELLED = "cancelled"
    private const val STATUS_ERROR = "error"

    private const val ERROR_TYPE_API = "api"
    private const val ERROR_TYPE_UNAVAILABLE = "unavailable"
    private const val ERROR_TYPE_INTERNAL = "internal"
    private const val ERROR_TYPE_UNEXPECTED = "unexpected"

    private const val E_NO_ACTIVITY = "activity_error"
    private const val E_DECODE = "decode_error"
    private const val E_PASS = "pass_error"
    private const val E_SAVE = "save_error"
    private const val E_PRESENTATION = "presentation_error"
    private const val E_UNSUPPORTED_PLATFORM = "E_UNSUPPORTED_PLATFORM"
  }
}
