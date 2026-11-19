import { TurboModuleRegistry, type TurboModule } from 'react-native';

export type NativePassRelevantDate = {
  /** Epoch milliseconds. Set for single-date relevance. */
  date?: number;
  /** Epoch milliseconds. Set for interval relevance. */
  startDate?: number;
  /** Epoch milliseconds. Set for interval relevance. */
  endDate?: number;
};

export type NativePass = {
  passTypeIdentifier: string;
  serialNumber: string;
  passType: string;
  organizationName: string;
  localizedName: string;
  localizedDescription: string;
  passURL?: string;
  webServiceURL?: string;
  authenticationToken?: string;
  deviceName: string;
  isRemotePass: boolean;
  relevantDates: NativePassRelevantDate[];
  userInfo?: Object;
};

export interface Spec extends TurboModule {
  /**
   * iOS: whether the device can add passes to Apple Wallet (`format` ignored).
   * Android: whether the Google Wallet save API for `format` is available.
   */
  canAddPasses(format: string): Promise<boolean>;

  /**
   * iOS: present the Apple Wallet sheet for a base64 encoded `.pkpass`.
   * Android: save a base64 encoded Google Wallet pass (JSON) via the Pay client.
   */
  addPass(base64EncodedPass: string): Promise<void>;

  /**
   * iOS: present one Apple Wallet sheet for several base64 encoded `.pkpass` files.
   * Android: save one base64 encoded Google Wallet JSON (which may itself
   * contain several objects). More than one entry rejects.
   */
  addPasses(base64EncodedPasses: string[]): Promise<void>;

  /**
   * Android only. Save a Google Wallet pass from a signed JWT.
   */
  addPassJWT(passJWT: string): Promise<void>;

  /**
   * The user facing name of the wallet app ("Apple Wallet", "Google Wallet"
   * or "Google Pay" depending on the market).
   */
  getWalletName(): Promise<string>;

  // ---- iOS only (Apple Wallet pass library) ----

  isPassLibraryAvailable(): Promise<boolean>;
  containsPass(base64EncodedPass: string): Promise<boolean>;
  getPasses(): Promise<NativePass[]>;
  getPass(
    passTypeIdentifier: string,
    serialNumber: string
  ): Promise<NativePass | null>;
  getPassFieldValue(
    passTypeIdentifier: string,
    serialNumber: string,
    fieldKey: string
  ): Promise<string | null>;
  replacePass(base64EncodedPass: string): Promise<boolean>;
  removePass(passTypeIdentifier: string, serialNumber: string): Promise<void>;
  openPass(passTypeIdentifier: string, serialNumber: string): Promise<void>;

  // Required by NativeEventEmitter for `addPassResult` / `passLibraryChanged`.
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativePasskit');
