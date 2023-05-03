package com.passkit

import android.widget.FrameLayout
import android.widget.ImageView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter


class AddPassButton(
  private val themedReactContext: ThemedReactContext,
): FrameLayout(themedReactContext){
  private val rctEventEmitter: RCTEventEmitter = themedReactContext.getJSModule(RCTEventEmitter::class.java)
  private val imageButton: ImageView = ImageView(themedReactContext)

  init {
    imageButton.layoutParams = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )
    imageButton.setOnClickListener {
      emitReactEvent(PasskitInterface.ON_PRESS)
    }
    addView(imageButton)
    setVariant("dark")
  }

  fun setVariant(variant: String?){
    val resId = when (variant){
      "light" -> R.drawable.save_to_google_pay_light
      "light-outline" -> R.drawable.save_to_google_pay_light_with_stroke
      else -> R.drawable.save_to_google_pay_dark
    }

    imageButton.setImageDrawable(resources.getDrawable(resId));
  }

  private fun emitReactEvent(name: String){
    emitReactEvent(name, Arguments.createMap())
  }

  private fun emitReactEvent(name: String, data: WritableMap){
    rctEventEmitter.receiveEvent(id, name, data)
  }
}
