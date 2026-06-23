#import "PasskitButtonView.h"

#import <PassKit/PassKit.h>

#import <react/renderer/components/ReactNativePasskitSpec/ComponentDescriptors.h>
#import <react/renderer/components/ReactNativePasskitSpec/EventEmitters.h>
#import <react/renderer/components/ReactNativePasskitSpec/Props.h>
#import <react/renderer/components/ReactNativePasskitSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface PasskitButtonView () <RCTPasskitButtonViewProtocol>
@end

@implementation PasskitButtonView {
  PKAddPassButton *_button;
  std::string _variant;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<PasskitButtonComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const PasskitButtonProps>();
    _props = defaultProps;
    _variant = defaultProps->variant;
    [self renderButton];
  }

  return self;
}

- (void)renderButton
{
  [_button removeFromSuperview];

  PKAddPassButtonStyle style = _variant == "dark-outline" ? PKAddPassButtonStyleBlackOutline : PKAddPassButtonStyleBlack;

  _button = [[PKAddPassButton alloc] initWithAddPassButtonStyle:style];
  _button.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  _button.frame = self.bounds;
  [_button addTarget:self
                action:@selector(handlePress)
      forControlEvents:UIControlEventTouchUpInside];

  self.contentView = _button;
}

- (void)handlePress
{
  if (_eventEmitter) {
    auto emitter = std::static_pointer_cast<const PasskitButtonEventEmitter>(_eventEmitter);
    emitter->onAddButtonPress(PasskitButtonEventEmitter::OnAddButtonPress{});
  }
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<PasskitButtonProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<PasskitButtonProps const>(props);

  if (oldViewProps.variant != newViewProps.variant) {
    _variant = newViewProps.variant;
    [self renderButton];
  }

  [super updateProps:props oldProps:oldProps];
}

@end
