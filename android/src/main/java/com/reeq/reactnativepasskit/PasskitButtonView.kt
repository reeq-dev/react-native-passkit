package com.reeq.reactnativepasskit

import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

/**
 * Official "Add to Google Wallet" button.
 *
 * The layouts and localized drawables come unchanged from Google's Android
 * button assets (https://developers.google.com/wallet/generic/resources/brand-guidelines),
 * with resource names prefixed by `rnpk_` so they can't clash with an app that
 * also bundles them. Google only allows the black button, in two styles:
 * - `primary`: "Add to Google Wallet" on one line.
 * - `condensed`: two lines, for narrow layouts.
 */
class PasskitButtonView(context: ReactContext) : FrameLayout(context) {
  private var currentLayout = 0
  private var button: View? = null

  init {
    setVariant(null)
  }

  fun setVariant(variant: String?) {
    val layout =
      if (variant == VARIANT_CONDENSED) R.layout.rnpk_googlewallet_badge
      else R.layout.rnpk_googlewallet_button
    if (layout == currentLayout) return
    currentLayout = layout

    button?.let { removeView(it) }
    button =
      LayoutInflater.from(context).inflate(layout, this, false).also {
        // React Native controls the size; fill whatever bounds we get.
        it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        it.setOnClickListener { emitOnPress() }
        addView(it)
      }
  }

  // React Native swallows requestLayout() from native children, so a child
  // added after mount (variant change) would never be measured. Lay it out here.
  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
    )
    layout(left, top, right, bottom)
  }

  override fun requestLayout() {
    super.requestLayout()
    @Suppress("SENSELESS_COMPARISON") // called from the super constructor
    if (measureAndLayout != null) post(measureAndLayout)
  }

  private fun emitOnPress() {
    val reactContext = context as ReactContext
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
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

  companion object {
    private const val VARIANT_CONDENSED = "condensed"
  }
}
