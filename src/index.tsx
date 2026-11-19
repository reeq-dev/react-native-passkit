import { useEffect, useState } from 'react';
import { NativeEventEmitter, Platform, StyleSheet } from 'react-native';
import ReactNativePasskit, {
  type NativePass,
  type NativePassRelevantDate,
} from './NativeReactNativePasskit';
import PasskitButton from './PasskitButtonNativeComponent';
import { resolveAndroidVariant } from './buttonVariant';
import type {
  AddPassButtonProps,
  AddPassResultEvent,
  Pass,
  PassFormat,
  PassIdentifier,
  PassLibraryChangedEvent,
  PassRelevantDate,
  PassType,
} from './types';

export type {
  AddPassButtonProps,
  AddPassResultErrorType,
  AddPassResultEvent,
  AddPassResultStatus,
  AndroidVariant,
  IOSVariant,
  Pass,
  PassFormat,
  PassIdentifier,
  PassLibraryChangedEvent,
  PassRelevantDate,
  PassType,
} from './types';

const emitter = new NativeEventEmitter(ReactNativePasskit);

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

/** Error code used when a method is not available on the current platform. */
export const UNSUPPORTED_PLATFORM = 'E_UNSUPPORTED_PLATFORM';

const unsupported = (method: string): Promise<never> => {
  const error = new Error(
    `${method} is not supported on ${Platform.OS}.`
  ) as Error & { code: string };
  error.code = UNSUPPORTED_PLATFORM;
  return Promise.reject(error);
};

const toDate = (ms?: number) => (ms == null ? undefined : new Date(ms));

const toPass = (pass: NativePass): Pass => ({
  ...pass,
  passType: pass.passType as PassType,
  userInfo: pass.userInfo as Record<string, unknown> | undefined,
  relevantDates: pass.relevantDates.map(
    (d: NativePassRelevantDate): PassRelevantDate => ({
      date: toDate(d.date),
      startDate: toDate(d.startDate),
      endDate: toDate(d.endDate),
    })
  ),
});

// ---------------------------------------------------------------------------
// Cross-platform
// ---------------------------------------------------------------------------

/**
 * Check whether it is possible to add passes on the device.
 *
 * On Android `format` selects which Google Wallet save API is checked
 * (`'json'` for {@link addPass}, `'jwt'` for {@link addPassJWT}). Ignored on iOS.
 */
export const canAddPasses = (format: PassFormat = 'json'): Promise<boolean> =>
  ReactNativePasskit.canAddPasses(format);

/**
 * Provide a base64 encoded pass to add it to the wallet.
 *
 * iOS: a `.pkpass` file. Android: a Google Wallet JSON save payload.
 */
export const addPass = (base64EncodedPass: string): Promise<void> =>
  ReactNativePasskit.addPass(base64EncodedPass);

/**
 * Add several passes in one go.
 *
 * iOS: shows a single Apple Wallet sheet for all the `.pkpass` files.
 * Android: Google Wallet bundles multiple passes inside one JSON payload, so
 * pass exactly one base64 encoded JSON that contains all objects.
 */
export const addPasses = (base64EncodedPasses: string[]): Promise<void> =>
  ReactNativePasskit.addPasses(base64EncodedPasses);

/**
 * Android only. Provide a JWT signed pass. Resolves without doing anything on iOS.
 */
export const addPassJWT = (passJWT: string): Promise<void> => {
  if (!isAndroid) {
    return Promise.resolve();
  }
  return ReactNativePasskit.addPassJWT(passJWT);
};

/**
 * The user facing name of the wallet app: `"Apple Wallet"` on iOS,
 * `"Google Wallet"` or `"Google Pay"` (market dependent) on Android.
 */
export const getWalletName = (): Promise<string> =>
  ReactNativePasskit.getWalletName();

// ---------------------------------------------------------------------------
// iOS pass library
// ---------------------------------------------------------------------------

/**
 * iOS only. Whether the Apple Wallet pass library is available. Resolves
 * `false` on Android.
 */
export const isPassLibraryAvailable = (): Promise<boolean> =>
  isIOS ? ReactNativePasskit.isPassLibraryAvailable() : Promise.resolve(false);

/**
 * iOS only. Provide a base64 encoded pass to check whether the wallet already
 * contains it. Resolves `false` on Android.
 */
export const containsPass = (base64EncodedPass: string): Promise<boolean> =>
  isIOS
    ? ReactNativePasskit.containsPass(base64EncodedPass)
    : Promise.resolve(false);

/**
 * iOS only. All passes in Apple Wallet that your app may access (limited by
 * the Pass Type IDs entitlement). Resolves `[]` on Android.
 */
export const getPasses = async (): Promise<Pass[]> => {
  if (!isIOS) {
    return [];
  }
  const passes = await ReactNativePasskit.getPasses();
  return passes.map(toPass);
};

/**
 * iOS only. Look up a pass by its pass type identifier and serial number.
 * Resolves `null` when not found and on Android.
 */
export const getPass = async (
  passTypeIdentifier: string,
  serialNumber: string
): Promise<Pass | null> => {
  if (!isIOS) {
    return null;
  }
  const pass = await ReactNativePasskit.getPass(
    passTypeIdentifier,
    serialNumber
  );
  return pass ? toPass(pass) : null;
};

/**
 * iOS only. Localized value of a field (by its `key` in `pass.json`).
 * Resolves `null` when the pass or field is missing, and on Android.
 */
export const getPassFieldValue = (
  passTypeIdentifier: string,
  serialNumber: string,
  fieldKey: string
): Promise<string | null> =>
  isIOS
    ? ReactNativePasskit.getPassFieldValue(
        passTypeIdentifier,
        serialNumber,
        fieldKey
      )
    : Promise.resolve(null);

/**
 * iOS only. Silently replace an existing pass with a newer version of it
 * (same pass type identifier and serial number). Resolves whether the pass
 * was replaced. Rejects with {@link UNSUPPORTED_PLATFORM} on Android.
 */
export const replacePass = (base64EncodedPass: string): Promise<boolean> =>
  isIOS
    ? ReactNativePasskit.replacePass(base64EncodedPass)
    : unsupported('replacePass');

/**
 * iOS only. Remove a pass from Apple Wallet. Rejects with
 * {@link UNSUPPORTED_PLATFORM} on Android.
 */
export const removePass = (
  passTypeIdentifier: string,
  serialNumber: string
): Promise<void> =>
  isIOS
    ? ReactNativePasskit.removePass(passTypeIdentifier, serialNumber)
    : unsupported('removePass');

/**
 * iOS only. Open a pass in the Wallet app. Rejects with
 * {@link UNSUPPORTED_PLATFORM} on Android.
 */
export const openPass = (
  passTypeIdentifier: string,
  serialNumber: string
): Promise<void> =>
  isIOS
    ? ReactNativePasskit.openPass(passTypeIdentifier, serialNumber)
    : unsupported('openPass');

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export function AddPassButton({
  variant,
  onPress,
  style,
  ...props
}: AddPassButtonProps) {
  const android = resolveAndroidVariant(variant?.android);
  return (
    <PasskitButton
      style={[
        Platform.OS === 'android' && android === 'condensed'
          ? styles.condensedButton
          : styles.passButton,
        style,
      ]}
      {...props}
      onAddButtonPress={onPress ? () => onPress() : undefined}
      variant={Platform.select({
        ios: variant?.ios,
        android,
      })}
    />
  );
}

const styles = StyleSheet.create({
  // Google's layouts are 48 (primary) and 53 (condensed) high.
  passButton: {
    height: Platform.select({
      android: 48,
      ios: 60,
    }),
    width: Platform.select({
      android: 288,
      ios: 260,
    }),
  },
  condensedButton: {
    height: 53,
    width: 200,
  },
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/**
 * Listen for the add-pass result status. May contain an error message.
 *
 * @returns an unsubscribe function.
 */
export const addPassResultListener = (
  cb: (event: AddPassResultEvent) => void
): (() => void) => {
  const subscription = emitter.addListener('addPassResult', (event: unknown) =>
    cb(event as AddPassResultEvent)
  );
  return () => subscription.remove();
};

/**
 * Hook wrapper over {@link addPassResultListener}.
 */
export const useAddPassResult = (): AddPassResultEvent | undefined => {
  const [result, setResult] = useState<AddPassResultEvent>();

  useEffect(() => addPassResultListener(setResult), []);

  return result;
};

type NativePassLibraryChangedEvent = {
  added: NativePass[];
  replaced: NativePass[];
  removed: PassIdentifier[];
};

/**
 * iOS only. Listen for changes to the Apple Wallet pass library (passes your
 * app can access being added, replaced or removed — by your app, the Wallet
 * app or a server push). Never fires on Android.
 *
 * @returns an unsubscribe function.
 */
export const passLibraryChangedListener = (
  cb: (event: PassLibraryChangedEvent) => void
): (() => void) => {
  if (!isIOS) {
    return () => {};
  }
  const subscription = emitter.addListener(
    'passLibraryChanged',
    (event: unknown) => {
      const e = event as NativePassLibraryChangedEvent;
      cb({
        added: e.added.map(toPass),
        replaced: e.replaced.map(toPass),
        removed: e.removed,
      });
    }
  );
  return () => subscription.remove();
};
