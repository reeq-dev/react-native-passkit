#import "React/RCTViewManager.h"
#import "React/RCTUIManager.h"
#import "React/RCTLog.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(AddPassButtonManager, RCTViewManager)

// props
RCT_EXPORT_VIEW_PROPERTY(variant, NSString)

// callbacks
RCT_EXPORT_VIEW_PROPERTY(onAddButtonPress, RCTDirectEventBlock)

@end
