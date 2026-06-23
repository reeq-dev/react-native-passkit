import type { ViewProps } from 'react-native';

export type AndroidVariant = 'dark' | 'light' | 'light-outline';
export type IOSVariant = 'dark' | 'dark-outline';

export interface AddPassButtonProps extends ViewProps {
  /**
   * ios: 'dark' | 'dark-outline'
   * android: 'dark' | 'light' | 'light-outline'
   */
  variant?: {
    ios?: IOSVariant;
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
