import Foundation

@objc (AddPassButtonManager)
class AddPassButtonManager : RCTViewManager {
  override func view() -> UIView! {
    return AddPassButton()
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
