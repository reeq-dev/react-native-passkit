package com.reeq.reactnativepasskit

import android.widget.FrameLayout
import android.widget.ImageView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

class PasskitButtonView(context: ReactContext) : FrameLayout(context) {
  private val imageButton = ImageView(context)

  init {
    imageButton.layoutParams =
      LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    imageButton.setOnClickListener { emitOnPress() }
    addView(imageButton)
    setVariant("dark")
  }

  fun setVariant(variant: String?) {
    val resId =
      when (variant) {
        "light" -> R.drawable.save_to_google_pay_light
        "light-outline" -> R.drawable.save_to_google_pay_light_with_stroke
        else -> R.drawable.save_to_google_pay_dark
      }
    imageButton.setImageResource(resId)
  }

  private fun emitOnPress() {
    val reactContext = context as ReactContext
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val dispatcher = UIManagerHelper.getEventDispatcher(reactContext)
    dispatcher?.dispatchEvent(OnAddButtonPressEvent(surfaceId, id))
  }

  private class OnAddButtonPressEvent(surfaceId: Int, viewId: Int) :
    Event<OnAddButtonPressEvent>(surfaceId, viewId) {
    override fun getEventName(): String = EVENT_NAME

    override fun getEventData(): WritableMap = Arguments.createMap()

    companion object {
      const val EVENT_NAME = "topAddButtonPress"
    }
  }
}
