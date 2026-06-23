package com.reeq.reactnativepasskit

import android.app.Activity
import android.content.Intent
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.pay.Pay
import com.google.android.gms.pay.PayApiAvailabilityStatus
import com.google.android.gms.pay.PayClient

class ReactNativePasskitModule(private val reactContext: ReactApplicationContext) :
  NativeReactNativePasskitSpec(reactContext), LifecycleEventListener {

  private var walletClient: PayClient? = null
  private var listenerCount = 0

  private val activityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
      ) {
        if (requestCode != ADD_TO_GOOGLE_WALLET_REQUEST_CODE) return

        when (resultCode) {
          Activity.RESULT_OK ->
            emitResult(
              Arguments.createMap().apply { putString(KEY_STATUS, STATUS_SUCCESS) }
            )

          Activity.RESULT_CANCELED ->
            emitResult(
              Arguments.createMap().apply { putString(KEY_STATUS, STATUS_CANCELLED) }
            )

          PayClient.SavePassesResult.SAVE_ERROR ->
            emitResult(
              Arguments.createMap().apply {
                putString(KEY_STATUS, STATUS_ERROR)
                putString(KEY_ERROR_TYPE, ERROR_TYPE_API)
                putString(
                  KEY_MESSAGE,
                  data?.getStringExtra(PayClient.EXTRA_API_ERROR_MESSAGE).toString()
                )
              }
            )

          else ->
            emitResult(
              Arguments.createMap().apply {
                putString(KEY_STATUS, STATUS_ERROR)
                putString(KEY_ERROR_TYPE, ERROR_TYPE_UNEXPECTED)
              }
            )
        }
      }
    }

  init {
    reactContext.addActivityEventListener(activityEventListener)
    reactContext.addLifecycleEventListener(this)
  }

  override fun onHostResume() {
    reactContext.currentActivity?.let {
      if (walletClient == null) {
        walletClient = Pay.getClient(it)
      }
    }
  }

  override fun onHostPause() {}

  override fun onHostDestroy() {}

  override fun canAddPasses(promise: Promise) {
    val client = walletClient
    if (client == null) {
      promise.resolve(false)
      return
    }

    client
      .getPayApiAvailabilityStatus(PayClient.RequestType.SAVE_PASSES)
      .addOnSuccessListener { status ->
        promise.resolve(status == PayApiAvailabilityStatus.AVAILABLE)
      }
      .addOnFailureListener { promise.resolve(false) }
  }

  override fun addPass(base64EncodedPass: String, promise: Promise) {
    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.resolve(false)
      return
    }

    val pass = Base64.decode(base64EncodedPass, Base64.DEFAULT).toString(Charsets.UTF_8)
    walletClient?.savePasses(pass, activity, ADD_TO_GOOGLE_WALLET_REQUEST_CODE)
    promise.resolve(true)
  }

  override fun addPassJWT(passJWT: String, promise: Promise) {
    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.resolve(false)
      return
    }

    walletClient?.savePassesJwt(passJWT, activity, ADD_TO_GOOGLE_WALLET_REQUEST_CODE)
    promise.resolve(true)
  }

  override fun containsPass(base64EncodedPass: String, promise: Promise) {
    // `containsPass` is an iOS (Apple Wallet) only API. Always false on Android.
    promise.resolve(false)
  }

  override fun addListener(eventName: String) {
    listenerCount += 1
  }

  override fun removeListeners(count: Double) {
    listenerCount -= count.toInt()
  }

  private fun emitResult(params: WritableMap) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_ADD_PASS_RESULT, params)
  }

  companion object {
    const val NAME = NativeReactNativePasskitSpec.NAME

    private const val ADD_TO_GOOGLE_WALLET_REQUEST_CODE = 1000
    private const val EVENT_ADD_PASS_RESULT = "addPassResult"

    private const val KEY_STATUS = "status"
    private const val KEY_ERROR_TYPE = "errorType"
    private const val KEY_MESSAGE = "message"

    private const val STATUS_SUCCESS = "success"
    private const val STATUS_CANCELLED = "cancelled"
    private const val STATUS_ERROR = "error"

    private const val ERROR_TYPE_API = "api"
    private const val ERROR_TYPE_UNEXPECTED = "unexpected"
  }
}
