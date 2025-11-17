import Foundation
import React

@objc(ReceiptReader)
class ReceiptReader: NSObject {
  
  @objc
  func getBase64Receipt(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
          FileManager.default.fileExists(atPath: appStoreReceiptURL.path) else {
      reject("NO_RECEIPT", "No receipt file found", nil)
      return
    }
    
    do {
      let receiptData = try Data(contentsOf: appStoreReceiptURL, options: .alwaysMapped)
      let base64String = receiptData.base64EncodedString(options: [])
      resolve(base64String)
    } catch {
      reject("READ_ERROR", "Could not read receipt data", error)
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}