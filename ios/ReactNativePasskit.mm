#import "ReactNativePasskit.h"

#import <PassKit/PassKit.h>
#import <UIKit/UIKit.h>

static NSString *const kEventAddPassResult = @"addPassResult";
static NSString *const kEventPassLibraryChanged = @"passLibraryChanged";

@interface ReactNativePasskit () <PKAddPassesViewControllerDelegate>
@end

@implementation ReactNativePasskit {
  // Passes shown in the currently presented add-passes sheet. Non-nil while a
  // sheet is on screen, which also guards against concurrent presentations.
  NSArray<PKPass *> *_pendingPasses;
  PKPassLibrary *_library;
  BOOL _hasListeners;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (instancetype)init
{
  if (self = [super init]) {
    _library = [[PKPassLibrary alloc] init];
  }
  return self;
}

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents
{
  return @[ kEventAddPassResult, kEventPassLibraryChanged ];
}

- (void)startObserving
{
  _hasListeners = YES;
  // Every PKPassLibrary instance in the process posts its own copy of this
  // notification (PassKit creates some internally, e.g. for the add sheet),
  // so only listen to ours to emit each change exactly once.
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:PKPassLibraryDidChangeNotification
                                                object:_library];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(passLibraryDidChange:)
                                               name:PKPassLibraryDidChangeNotification
                                             object:_library];
}

- (void)stopObserving
{
  _hasListeners = NO;
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:PKPassLibraryDidChangeNotification
                                                object:_library];
}

- (void)emit:(NSString *)name body:(NSDictionary *)body
{
  if (_hasListeners) {
    [self sendEventWithName:name body:body];
  }
}

- (void)passLibraryDidChange:(NSNotification *)notification
{
  NSDictionary *info = notification.userInfo ?: @{};

  NSMutableArray *added = [NSMutableArray array];
  for (PKPass *pass in info[PKPassLibraryAddedPassesUserInfoKey] ?: @[]) {
    [added addObject:[self serializePass:pass]];
  }

  NSMutableArray *replaced = [NSMutableArray array];
  for (PKPass *pass in info[PKPassLibraryReplacementPassesUserInfoKey] ?: @[]) {
    [replaced addObject:[self serializePass:pass]];
  }

  NSMutableArray *removed = [NSMutableArray array];
  for (NSDictionary *removedInfo in info[PKPassLibraryRemovedPassInfosUserInfoKey] ?: @[]) {
    [removed addObject:@{
      @"passTypeIdentifier" : removedInfo[PKPassLibraryPassTypeIdentifierUserInfoKey] ?: @"",
      @"serialNumber" : removedInfo[PKPassLibrarySerialNumberUserInfoKey] ?: @"",
    }];
  }

  [self emit:kEventPassLibraryChanged
        body:@{@"added" : added, @"replaced" : replaced, @"removed" : removed}];
}

#pragma mark - Spec: cross-platform

- (void)canAddPasses:(NSString *)format
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  resolve(@([PKAddPassesViewController canAddPasses]));
}

- (void)addPass:(NSString *)base64EncodedPass
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  [self addPasses:@[ base64EncodedPass ] resolve:resolve reject:reject];
}

- (void)addPasses:(NSArray *)base64EncodedPasses
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  if (base64EncodedPasses.count == 0) {
    reject(@"pass_error", @"No passes provided", nil);
    return;
  }

  NSMutableArray<PKPass *> *passes = [NSMutableArray arrayWithCapacity:base64EncodedPasses.count];
  for (NSString *base64 in base64EncodedPasses) {
    PKPass *pass = [self passFromBase64:base64 reject:reject];
    if (pass == nil) {
      return;
    }
    [passes addObject:pass];
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_pendingPasses != nil) {
      reject(@"presentation_error", @"An add pass sheet is already being presented", nil);
      return;
    }

    PKAddPassesViewController *passVC = passes.count == 1
        ? [[PKAddPassesViewController alloc] initWithPass:passes.firstObject]
        : [[PKAddPassesViewController alloc] initWithPasses:passes];
    if (passVC == nil) {
      reject(@"vc_error", @"Cannot create PKAddPassesViewController", nil);
      return;
    }

    UIViewController *topVC = [self topViewController];
    if (topVC == nil) {
      reject(@"window_error", @"Cannot find top view controller", nil);
      return;
    }

    if (topVC.isBeingPresented || topVC.isBeingDismissed) {
      reject(@"presentation_error", @"A view controller transition is in progress", nil);
      return;
    }

    self->_pendingPasses = passes;
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

- (void)getWalletName:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve(@"Apple Wallet");
}

#pragma mark - Spec: pass library

- (void)isPassLibraryAvailable:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject
{
  resolve(@([PKPassLibrary isPassLibraryAvailable]));
}

- (void)containsPass:(NSString *)base64EncodedPass
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  PKPass *pass = [self passFromBase64:base64EncodedPass reject:reject];
  if (pass == nil) {
    return;
  }
  resolve(@([_library containsPass:pass]));
}

- (void)getPasses:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  NSMutableArray *result = [NSMutableArray array];
  for (PKPass *pass in [_library passes]) {
    [result addObject:[self serializePass:pass]];
  }
  resolve(result);
}

- (void)getPass:(NSString *)passTypeIdentifier
    serialNumber:(NSString *)serialNumber
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  PKPass *pass = [_library passWithPassTypeIdentifier:passTypeIdentifier serialNumber:serialNumber];
  resolve(pass != nil ? [self serializePass:pass] : [NSNull null]);
}

- (void)getPassFieldValue:(NSString *)passTypeIdentifier
             serialNumber:(NSString *)serialNumber
                 fieldKey:(NSString *)fieldKey
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  PKPass *pass = [_library passWithPassTypeIdentifier:passTypeIdentifier serialNumber:serialNumber];
  id value = [pass localizedValueForFieldKey:fieldKey];
  if (value == nil) {
    resolve([NSNull null]);
  } else if ([value isKindOfClass:[NSString class]]) {
    resolve(value);
  } else if ([value isKindOfClass:[NSDate class]]) {
    NSISO8601DateFormatter *formatter = [[NSISO8601DateFormatter alloc] init];
    resolve([formatter stringFromDate:value]);
  } else {
    resolve([value description]);
  }
}

- (void)replacePass:(NSString *)base64EncodedPass
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  PKPass *pass = [self passFromBase64:base64EncodedPass reject:reject];
  if (pass == nil) {
    return;
  }
  resolve(@([_library replacePassWithPass:pass]));
}

- (void)removePass:(NSString *)passTypeIdentifier
      serialNumber:(NSString *)serialNumber
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  PKPass *pass = [_library passWithPassTypeIdentifier:passTypeIdentifier serialNumber:serialNumber];
  if (pass == nil) {
    reject(@"pass_not_found", @"No accessible pass with this identifier and serial number", nil);
    return;
  }
  [_library removePass:pass];
  resolve(nil);
}

- (void)openPass:(NSString *)passTypeIdentifier
    serialNumber:(NSString *)serialNumber
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  PKPass *pass = [_library passWithPassTypeIdentifier:passTypeIdentifier serialNumber:serialNumber];
  if (pass == nil) {
    reject(@"pass_not_found", @"No accessible pass with this identifier and serial number", nil);
    return;
  }
  NSURL *url = pass.passURL;
  if (url == nil) {
    reject(@"open_error", @"The pass has no Wallet URL", nil);
    return;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    [UIApplication.sharedApplication openURL:url
                                     options:@{}
                           completionHandler:^(BOOL success) {
                             if (success) {
                               resolve(nil);
                             } else {
                               reject(@"open_error", @"Cannot open the pass in Wallet", nil);
                             }
                           }];
  });
}

#pragma mark - PKAddPassesViewControllerDelegate

- (void)addPassesViewControllerDidFinish:(PKAddPassesViewController *)controller
{
  NSArray<PKPass *> *passes = _pendingPasses;
  _pendingPasses = nil;

  if (passes != nil) {
    // The sheet is all-or-nothing ("Add" / "Add All" vs "Cancel"), so one
    // contained pass is enough to know the user accepted.
    BOOL added = NO;
    for (PKPass *pass in passes) {
      if ([_library containsPass:pass]) {
        added = YES;
        break;
      }
    }
    [self emit:kEventAddPassResult body:@{@"status" : added ? @"success" : @"cancelled"}];
  }
  [controller dismissViewControllerAnimated:YES completion:nil];
}

#pragma mark - Helpers

- (PKPass *)passFromBase64:(NSString *)base64 reject:(RCTPromiseRejectBlock)reject
{
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64
                                                     options:NSDataBase64DecodingIgnoreUnknownCharacters];
  if (data == nil) {
    reject(@"decode_error", @"Can not decode base64 data", nil);
    return nil;
  }

  NSError *error = nil;
  PKPass *pass = [[PKPass alloc] initWithData:data error:&error];
  if (pass == nil || error != nil) {
    reject(@"pass_error", @"Can not read pass, probably wrong parameters", error);
    return nil;
  }
  return pass;
}

- (NSNumber *)millis:(NSDate *)date
{
  return @((long long)(date.timeIntervalSince1970 * 1000.0));
}

- (NSDictionary *)serializePass:(PKPass *)pass
{
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  dict[@"passTypeIdentifier"] = pass.passTypeIdentifier ?: @"";
  dict[@"serialNumber"] = pass.serialNumber ?: @"";
  dict[@"organizationName"] = pass.organizationName ?: @"";
  dict[@"localizedName"] = pass.localizedName ?: @"";
  dict[@"localizedDescription"] = pass.localizedDescription ?: @"";
  dict[@"deviceName"] = pass.deviceName ?: @"";
  dict[@"isRemotePass"] = @(pass.isRemotePass);

  switch (pass.passType) {
    case PKPassTypeBarcode:
      dict[@"passType"] = @"barcode";
      break;
    case PKPassTypeSecureElement:
      dict[@"passType"] = @"secureElement";
      break;
    default:
      dict[@"passType"] = @"any";
      break;
  }

  if (pass.passURL != nil) {
    dict[@"passURL"] = pass.passURL.absoluteString;
  }
  if (pass.webServiceURL != nil) {
    dict[@"webServiceURL"] = pass.webServiceURL.absoluteString;
  }
  if (pass.authenticationToken != nil) {
    dict[@"authenticationToken"] = pass.authenticationToken;
  }
  if (pass.userInfo != nil && [NSJSONSerialization isValidJSONObject:pass.userInfo]) {
    dict[@"userInfo"] = pass.userInfo;
  }

  NSMutableArray *relevantDates = [NSMutableArray array];
  if (@available(iOS 18.0, *)) {
    for (PKPassRelevantDate *relevant in pass.relevantDates) {
      if (relevant.interval != nil) {
        [relevantDates addObject:@{
          @"startDate" : [self millis:relevant.interval.startDate],
          @"endDate" : [self millis:relevant.interval.endDate],
        }];
      } else if (relevant.date != nil) {
        [relevantDates addObject:@{@"date" : [self millis:relevant.date]}];
      }
    }
  } else {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    if (pass.relevantDate != nil) {
      [relevantDates addObject:@{@"date" : [self millis:pass.relevantDate]}];
    }
#pragma clang diagnostic pop
  }
  dict[@"relevantDates"] = relevantDates;

  return dict;
}

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
