import Foundation
import UIKit
import AVFoundation
import PassKit
import React

@objc(PasskitModule)
class PasskitModule: RCTEventEmitter {
    
    var pass: PKPass? = nil
    var hasListeners: Bool = false
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
      return ["addPassResult"]
    }
    
    func sendReactEvent(_ body: NSDictionary = [:]) {
        if !hasListeners { return }
        sendEvent(withName: "addPassResult", body: body)
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }

    @objc(canAddPasses:rejecter:)
        func canAddPasses(_ resolve: RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) { resolve(PKAddPassesViewController.canAddPasses())
        }

    @objc(containsPass:resolver:rejecter:) func containsPass(_ base64Encoded: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        guard let decodedData = Data(base64Encoded: base64Encoded) else {
            reject("", "Can not decode base64 data", nil)
            return
        }
        
        do {
            guard let nextPass = try? PKPass(data: decodedData) else {
                reject("", "Can not read pass, probably wrong parameters", nil)
                return
            }
            
            let passLib = PKPassLibrary()
            
            resolve(passLib.containsPass(nextPass))
            
        }
    }
    
    
    func getTopViewController(_ rootViewController: UIViewController? = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
        .first(where: { $0.isKeyWindow })?.rootViewController) -> UIViewController? {

        if let nav = rootViewController as? UINavigationController {
            return getTopViewController(nav.visibleViewController)
        }

        if let tab = rootViewController as? UITabBarController {
            return getTopViewController(tab.selectedViewController)
        }

        if let presented = rootViewController?.presentedViewController {
            return getTopViewController(presented)
        }

        return rootViewController
    }
        
    
    @objc(addPass:resolver:rejecter:)
        func addPass(_ base64Encoded: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {

            guard let decodedData = Data(base64Encoded: base64Encoded) else {
                reject("", "Can not decode base64 data", nil)
                return
            }
            
            DispatchQueue.main.async(execute: {
                do {
                    self.pass = try? PKPass(data: decodedData)
                    
                    if self.pass == nil {
                        reject("", "Can not read pass, probably wrong parameters", nil)
                        return
                    }
                    
                    guard let addPassesVC = PKAddPassesViewController(pass: self.pass!) else {
                        reject("vc_error", "Cannot create PKAddPassesViewController", nil)
                        return
                    }

                    guard let topVC = self.getTopViewController() else {
                        reject("window_error", "Cannot find top view controller", nil)
                        return
                    }
                    
                    if topVC.presentedViewController != nil {
                        reject("presentation_error", "A view controller is already being presented", nil)
                        return
                    }

                    addPassesVC.delegate = self
                    
                    topVC.present(addPassesVC, animated: true, completion: {() in
                        resolve(nil)
                    })
                    return
                }
            })
    }
}

extension PasskitModule: PKAddPassesViewControllerDelegate {
    func addPassesViewControllerDidFinish(_ controller: PKAddPassesViewController) {
        if pass == nil { return }
        
        let passLib = PKPassLibrary()
    
        if passLib.containsPass(pass!) {
            sendReactEvent(["status": "success"])
        } else {
            sendReactEvent(["status": "cancelled"])
        }
        
        pass = nil
        
        controller.dismiss(animated: true, completion: nil)
    }
}
