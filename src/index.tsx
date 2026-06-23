import { useEffect, useState } from 'react';
import { NativeEventEmitter, Platform, StyleSheet } from 'react-native';
import ReactNativePasskit from './NativeReactNativePasskit';
import PasskitButton from './PasskitButtonNativeComponent';
import type { AddPassButtonProps, AddPassResultEvent } from './types';

export type {
  AddPassButtonProps,
  AddPassResultErrorType,
  AddPassResultEvent,
  AddPassResultStatus,
  AndroidVariant,
  IOSVariant,
} from './types';

const emitter = new NativeEventEmitter(ReactNativePasskit);

/**
 * Check whether it is possible to add passes on the device.
 */
export const canAddPasses = (): Promise<boolean> =>
  ReactNativePasskit.canAddPasses();

/**
 * Provide a base64 encoded pass to add it to the wallet.
 */
export const addPass = (base64EncodedPass: string): Promise<void> =>
  ReactNativePasskit.addPass(base64EncodedPass);

/**
 * iOS only. Provide a base64 encoded pass to check whether the wallet already
 * contains it.
 */
export const containsPass = (base64EncodedPass: string): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return Promise.resolve(false);
  }
  return ReactNativePasskit.containsPass(base64EncodedPass);
};

/**
 * Android only. Provide a JWT signed pass.
 */
export const addPassJWT = (passJWT: string): Promise<void> => {
  if (Platform.OS !== 'android') {
    return Promise.resolve();
  }
  return ReactNativePasskit.addPassJWT(passJWT);
};

export function AddPassButton({
  variant,
  onPress,
  style,
  ...props
}: AddPassButtonProps) {
  return (
    <PasskitButton
      style={[styles.passButton, style]}
      {...props}
      onAddButtonPress={onPress ? () => onPress() : undefined}
      variant={Platform.select({
        ios: variant?.ios,
        android: variant?.android,
      })}
    />
  );
}

const styles = StyleSheet.create({
  passButton: {
    height: Platform.select({
      android: 44,
      ios: 60,
    }),
    width: Platform.select({
      android: 288,
      ios: 260,
    }),
  },
});

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

  useEffect(() => {
    const subscription = emitter.addListener(
      'addPassResult',
      (event: unknown) => setResult(event as AddPassResultEvent)
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return result;
};
