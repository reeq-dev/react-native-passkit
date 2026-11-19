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

/**
 * Pass payload format. Only affects Android, where the Google Wallet save API
 * availability is checked separately for JSON and JWT payloads.
 */
export type PassFormat = 'json' | 'jwt';

export type AddPassResultStatus = 'success' | 'cancelled' | 'error';

/**
 * - `api`: Google Wallet rejected the pass (`SAVE_ERROR`), see `message`.
 * - `unavailable`: Google Wallet save API is unavailable (`API_UNAVAILABLE`).
 * - `internal`: Google Play services internal error (`INTERNAL_ERROR`).
 * - `unexpected`: any other result code.
 */
export type AddPassResultErrorType =
  | 'api'
  | 'unavailable'
  | 'internal'
  | 'unexpected';

export interface AddPassResultEvent {
  status: AddPassResultStatus;
  errorType?: AddPassResultErrorType;
  message?: string;
}

/** Apple `PKPassType`. */
export type PassType = 'barcode' | 'secureElement' | 'any';

export interface PassRelevantDate {
  /** Single relevant moment. */
  date?: Date;
  /** Start of a relevant interval. */
  startDate?: Date;
  /** End of a relevant interval. */
  endDate?: Date;
}

export interface PassIdentifier {
  passTypeIdentifier: string;
  serialNumber: string;
}

/**
 * A pass from the Apple Wallet pass library (`PKPass`).
 */
export interface Pass extends PassIdentifier {
  passType: PassType;
  organizationName: string;
  localizedName: string;
  localizedDescription: string;
  /** URL that opens the pass in Wallet. */
  passURL?: string;
  webServiceURL?: string;
  authenticationToken?: string;
  /** Name of the device that hosts the pass (e.g. a paired Apple Watch). */
  deviceName: string;
  /** Whether the pass lives on a paired device such as Apple Watch. */
  isRemotePass: boolean;
  relevantDates: PassRelevantDate[];
  /** Custom `userInfo` dictionary from `pass.json`. */
  userInfo?: Record<string, unknown>;
}

export interface PassLibraryChangedEvent {
  added: Pass[];
  replaced: Pass[];
  removed: PassIdentifier[];
}
