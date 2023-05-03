import type { ViewProps } from 'react-native';

type AndroidVariant = 'dark' | 'light' | 'light-outline';
type iOSVariant = 'dark' | 'dark-outline';

export interface AddPassButtonNativeProps {
  variant?: AndroidVariant | iOSVariant;

  onAddButtonPress?: () => void;
}

export interface AddPassButtonProps extends ViewProps {
  /**
   * ios: 'dark' | 'dark-outline'
   * android: 'dark' | 'light' | 'light-outline'
   */
  variant?: {
    ios?: iOSVariant;
    android?: AndroidVariant;
  };
  onPress?: () => void;
}

export type AddPassResultStatus = 'success' | 'cancelled' | 'error';

export type AddPassResultErrorType = 'api' | 'unexpected';

export interface AddPassResultEvent {
  status: AddPassResultStatus;
  errorType?: AddPassResultErrorType;
  message?: string;
}
