#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (DeviceInfoModule, NSObject)

RCT_EXTERN_METHOD(getDeviceModel : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getConnectionType : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(uses24HourClock : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getRegionInfo : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrencyCode : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasCheckedDeferredMatch : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(markDeferredMatchChecked : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

@end
