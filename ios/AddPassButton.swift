import Foundation
import UIKit
import PassKit

class AddPassButton: UIView {
  
  @objc var variant: NSString? // black, black-outline
  
  @objc var onAddButtonPress: RCTBubblingEventBlock?
  
  override init(frame: CGRect) {
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func didSetProps(_ changedProps: [String]!) {
    self.setNeedsLayout()
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    renderButton()
  }
  
  private func renderButton(){    
    for child in subviews {
      child.removeFromSuperview()
    }
    
    let buttonStyle = variant == "dark" ? PKAddPassButtonStyle.black : PKAddPassButtonStyle.blackOutline
    let passButton = PKAddPassButton(addPassButtonStyle: buttonStyle)
    
    passButton.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    passButton.frame = bounds
    
    passButton.addTarget(self, action: #selector(self.onPassButtonPress), for: .touchUpInside)
    
    self.addSubview(passButton)
    
  }
  
  @objc private func onPassButtonPress(){
    onAddButtonPress?([:])
  }
  
}
