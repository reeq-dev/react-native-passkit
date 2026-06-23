#import "ReactNativePasskit.h"

#import <PassKit/PassKit.h>
#import <UIKit/UIKit.h>

@interface ReactNativePasskit () <PKAddPassesViewControllerDelegate>
@end

@implementation ReactNativePasskit {
  PKPass *_pass;
  BOOL _hasListeners;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents
{
  return @[ @"addPassResult" ];
}

- (void)startObserving
{
  _hasListeners = YES;
}

- (void)stopObserving
{
  _hasListeners = NO;
}

- (void)emitResult:(NSDictionary *)body
{
  if (_hasListeners) {
    [self sendEventWithName:@"addPassResult" body:body];
  }
}

#pragma mark - Spec

- (void)canAddPasses:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  resolve(@([PKAddPassesViewController canAddPasses]));
}

- (void)containsPass:(NSString *)base64EncodedPass
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64EncodedPass options:0];
  if (data == nil) {
    reject(@"decode_error", @"Can not decode base64 data", nil);
    return;
  }

  NSError *error = nil;
  PKPass *pass = [[PKPass alloc] initWithData:data error:&error];
  if (pass == nil || error != nil) {
    reject(@"pass_error", @"Can not read pass, probably wrong parameters", error);
    return;
  }

  PKPassLibrary *library = [[PKPassLibrary alloc] init];
  resolve(@([library containsPass:pass]));
}

- (void)addPass:(NSString *)base64EncodedPass
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64EncodedPass options:0];
  if (data == nil) {
    reject(@"decode_error", @"Can not decode base64 data", nil);
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    NSError *error = nil;
    self->_pass = [[PKPass alloc] initWithData:data error:&error];
    if (self->_pass == nil || error != nil) {
      reject(@"pass_error", @"Can not read pass, probably wrong parameters", error);
      return;
    }

    PKAddPassesViewController *passVC = [[PKAddPassesViewController alloc] initWithPass:self->_pass];
    if (passVC == nil) {
      reject(@"vc_error", @"Cannot create PKAddPassesViewController", nil);
      return;
    }

    UIViewController *topVC = [self topViewController];
    if (topVC == nil) {
      reject(@"window_error", @"Cannot find top view controller", nil);
      return;
    }

    if (topVC.presentedViewController != nil) {
      reject(@"presentation_error", @"A view controller is already being presented", nil);
      return;
    }

    passVC.delegate = self;
    [topVC presentViewController:passVC
                       animated:YES
                     completion:^{
                       resolve(nil);
                     }];
  });
}

- (void)addPassJWT:(NSString *)passJWT
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  // `addPassJWT` is an Android (Google Wallet) only API. No-op on iOS.
  resolve(nil);
}

#pragma mark - PKAddPassesViewControllerDelegate

- (void)addPassesViewControllerDidFinish:(PKAddPassesViewController *)controller
{
  if (_pass != nil) {
    PKPassLibrary *library = [[PKPassLibrary alloc] init];
    if ([library containsPass:_pass]) {
      [self emitResult:@{ @"status" : @"success" }];
    } else {
      [self emitResult:@{ @"status" : @"cancelled" }];
    }
    _pass = nil;
  }
  [controller dismissViewControllerAnimated:YES completion:nil];
}

#pragma mark - Helpers

- (UIViewController *)topViewController
{
  UIWindow *keyWindow = nil;
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }
    for (UIWindow *window in ((UIWindowScene *)scene).windows) {
      if (window.isKeyWindow) {
        keyWindow = window;
        break;
      }
    }
    if (keyWindow != nil) {
      break;
    }
  }
  return [self topViewControllerFromRoot:keyWindow.rootViewController];
}

- (UIViewController *)topViewControllerFromRoot:(UIViewController *)root
{
  if ([root isKindOfClass:[UINavigationController class]]) {
    return [self topViewControllerFromRoot:((UINavigationController *)root).visibleViewController];
  }
  if ([root isKindOfClass:[UITabBarController class]]) {
    return [self topViewControllerFromRoot:((UITabBarController *)root).selectedViewController];
  }
  if (root.presentedViewController != nil) {
    return [self topViewControllerFromRoot:root.presentedViewController];
  }
  return root;
}

#pragma mark - TurboModule

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativePasskitSpecJSI>(params);
}

@end
