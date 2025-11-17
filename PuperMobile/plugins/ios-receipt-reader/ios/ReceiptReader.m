#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReceiptReader, NSObject)

RCT_EXTERN_METHOD(getBase64Receipt:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
