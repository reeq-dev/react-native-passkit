import { requireNativeComponent } from 'react-native';
import type { AddPassButtonNativeProps } from './types';

export const AddPassButtonNative =
  requireNativeComponent<AddPassButtonNativeProps>('AddPassButton');
