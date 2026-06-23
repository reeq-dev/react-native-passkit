import {
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /**
   * iOS: 'dark' | 'dark-outline'
   * Android: 'dark' | 'light' | 'light-outline'
   */
  variant?: CodegenTypes.WithDefault<string, 'dark'>;
  onAddButtonPress?: CodegenTypes.DirectEventHandler<Readonly<{}>> | null;
}

export default codegenNativeComponent<NativeProps>(
  'PasskitButton'
) as HostComponent<NativeProps>;
