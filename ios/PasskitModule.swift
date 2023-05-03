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
                    
                    guard let addPassesVC = PKAddPassesViewController(pass: self.pass!), let rootVC = UIApplication.shared.windows.first?.rootViewController else {
                        reject("", "Can not add pass, find root vc or PKAddPassesViewController is not supported", nil)
                        return
                    }

                    addPassesVC.delegate = self
                    
                    rootVC.present(addPassesVC, animated: true, completion: {() in
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
