package com.passkit

import android.app.Activity
import android.content.Intent
import android.util.Base64
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.pay.Pay
import com.google.android.gms.pay.PayApiAvailabilityStatus
import com.google.android.gms.pay.PayClient

class PasskitModule(
    private val reactContext: ReactApplicationContext
    ) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
    private var walletClient: PayClient? = null
    private val addToGoogleWalletRequestCode = 1000

    private var listenerCount = 0
    override fun getName() = "PasskitModule"

    private val activityEventListener = object : BaseActivityEventListener() {
      override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, intent: Intent?) {
        if (requestCode == addToGoogleWalletRequestCode) {
          when (resultCode) {
            Activity.RESULT_OK -> {
              sendReactEvent(reactContext, "addPassResult", Arguments.createMap().apply {
                putString(PasskitInterface.EVENT_PROPERTY_STATUS, PasskitInterface.ADD_PASS_RESULT_SUCCESS)
              })
            }

            Activity.RESULT_CANCELED -> {
              sendReactEvent(reactContext, "addPassResult", Arguments.createMap().apply {
                putString(PasskitInterface.EVENT_PROPERTY_STATUS, PasskitInterface.ADD_PASS_RESULT_CANCELLED)
              })
            }

            PayClient.SavePassesResult.SAVE_ERROR -> intent?.let { intentData ->
              val errorMessage = intentData.getStringExtra(PayClient.EXTRA_API_ERROR_MESSAGE)

              sendReactEvent(reactContext, "addPassResult", Arguments.createMap().apply {
                putString(PasskitInterface.EVENT_PROPERTY_STATUS, PasskitInterface.ADD_PASS_RESULT_ERROR)
                putString(PasskitInterface.EVENT_PROPERTY_ERROR_TYPE, PasskitInterface.ERROR_TYPE_API)
                putString(PasskitInterface.EVENT_PROPERTY_ERROR_MESSAGE, errorMessage.toString())
              })
            }

            else -> {
              sendReactEvent(reactContext, "addPassResult", Arguments.createMap().apply {
                putString(PasskitInterface.EVENT_PROPERTY_STATUS, PasskitInterface.ADD_PASS_RESULT_ERROR)
                putString(PasskitInterface.EVENT_PROPERTY_ERROR_TYPE, PasskitInterface.ERROR_TYPE_UNEXPECTED)
              })
            }
          }
        }
      }
    }

    init {
      reactContext.addActivityEventListener(activityEventListener)
      reactContext.addLifecycleEventListener(this)
    }
    override fun onHostResume() {
        reactContext.currentActivity?.let {
            if (walletClient == null){
                walletClient = Pay.getClient(it)
            }
        }
    }

    override fun onHostPause() {

    }

    override fun onHostDestroy() {

    }

    @ReactMethod
    fun canAddPasses(promise: Promise) {
        walletClient
            ?.getPayApiAvailabilityStatus(PayClient.RequestType.SAVE_PASSES)
            ?.addOnSuccessListener { status ->
                if (status == PayApiAvailabilityStatus.AVAILABLE) {
                    promise.resolve(true)
                } else {
                    promise.resolve(false)
                }
            }
            ?.addOnFailureListener {
                promise.resolve(false)
            }
    }

    @ReactMethod
    fun addPass(base64encodedPass: String, promise: Promise){
      val pass = Base64.decode(base64encodedPass, Base64.DEFAULT).toString()

        reactContext.currentActivity?.let {
            walletClient?.savePasses(pass, it, addToGoogleWalletRequestCode)
//            walletClient?.savePassesJwt()
            promise.resolve(true)
            return
        }
        promise.resolve(false)
    }

    @ReactMethod
    fun addPassJWT(passJWT: String, promise: Promise){
        reactContext.currentActivity?.let {
            walletClient?.savePassesJwt(passJWT, it, addToGoogleWalletRequestCode)

            promise.resolve(true)
            return
        }
        promise.resolve(false)
    }

    private fun sendReactEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(type: String) {
      listenerCount += 1
    }

    @ReactMethod
    fun removeListeners(count: Int) {
      listenerCount -= count
    }
}
