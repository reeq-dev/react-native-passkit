import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * iOS: whether the device can add passes to Apple Wallet.
   * Android: whether the Google Wallet API is available on the device.
   */
  canAddPasses(): Promise<boolean>;

  /**
   * iOS: present the Apple Wallet sheet for a base64 encoded `.pkpass`.
   * Android: save a base64 encoded Google Wallet pass (JSON) via the Pay client.
   */
  addPass(base64EncodedPass: string): Promise<void>;

  /**
   * Android only. Save a Google Wallet pass from a signed JWT.
   */
  addPassJWT(passJWT: string): Promise<void>;

  /**
   * iOS only. Whether Apple Wallet already contains the given base64 encoded pass.
   */
  containsPass(base64EncodedPass: string): Promise<boolean>;

  // Required by NativeEventEmitter for the `addPassResult` event.
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativePasskit');
