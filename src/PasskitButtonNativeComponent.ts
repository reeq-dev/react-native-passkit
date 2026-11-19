import {
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /**
   * iOS: 'dark' | 'dark-outline' (anything else renders 'dark')
   * Android: 'primary' | 'condensed' (anything else renders 'primary')
   */
  variant?: string;
  onAddButtonPress?: CodegenTypes.DirectEventHandler<Readonly<{}>> | null;
}

export default codegenNativeComponent<NativeProps>(
  'PasskitButton'
) as HostComponent<NativeProps>;
