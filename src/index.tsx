import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { AddPassButtonNative } from './add-pass-button-native';
import { Passkit, PasskitEventEmitter } from './passkit-module-native';
import type { AddPassButtonProps, AddPassResultEvent } from './types';

/**
 * Check if its possible to add pass on the device
 */

export const canAddPasses = (): Promise<boolean> => Passkit.canAddPasses();

/**
 * Provide a base64 encoded pass to add it to wallet
 */

export const addPass = (base64encodedPass: string): Promise<void> =>
  Passkit.addPass(base64encodedPass);

/**
 * iOS only. Provide a base64 encoded pass to check if wallet contains it already
 */
export const containsPass = (base64encodedPass: string): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return Promise.resolve(false);
  }
  return Passkit.containsPass(base64encodedPass);
};

/**
 * Android only. Provide a JWT signed pass
 */

export const addPassJWT = (passJWT: string): Promise<void> => {
  if (Platform.OS !== 'android') {
    return Promise.resolve();
  }
  return Passkit.addPassJWT(passJWT);
};

export const AddPassButton: React.FC<AddPassButtonProps> = ({
  variant,
  onPress,
  ...props
}) => {
  return (
    <AddPassButtonNative
      style={styles.passButton}
      {...props}
      onAddButtonPress={onPress}
      variant={Platform.select({
        ios: variant?.ios,
        android: variant?.android,
      })}
    />
  );
};

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
 * Listener add pass result status. Can send error with message
 */
export const addPassResultListener = (
  cb: (event: AddPassResultEvent) => void
) => PasskitEventEmitter.addListener('addPassResult', cb).remove;

/**
 * Hook wrapper over addPassResultListener
 */
export const useAddPassResult = () => {
  const [result, setResult] = useState<AddPassResultEvent>();

  useEffect(() => {
    const listener = PasskitEventEmitter.addListener(
      'addPassResult',
      setResult
    );
    return () => {
      listener.remove();
    };
  }, []);

  return result;
};
