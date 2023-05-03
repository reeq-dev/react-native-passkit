import React, { useEffect } from 'react';

import {
  AddPassButton,
  addPass,
  addPassResultListener,
  canAddPasses,
  containsPass,
} from '@reeq/react-native-passkit';
import { Platform, StyleSheet, View } from 'react-native';
import { testPass } from '../test-pass';

export default function App() {
  useEffect(() => {
    const unsubscribe = addPassResultListener((event) => {
      console.log(event);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddPassButton = async () => {
    try {
      const isAddable = await canAddPasses();

      if (!isAddable) {
        console.log("[can't add passes]", isAddable);
        return;
      }

      const hasPassAlready = await containsPass(testPass);

      if (hasPassAlready) {
        console.log('[has pass already]', hasPassAlready);
        return;
      }

      await addPass(testPass);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.box, styles.lightBox]}>
        <AddPassButton onPress={handleAddPassButton} />
      </View>
      <View style={[styles.box, styles.darkBox]}>
        <AddPassButton
          variant={{
            android: 'light',
            ios: 'dark-outline',
          }}
          onPress={handleAddPassButton}
        />
      </View>
      {Platform.OS === 'android' && (
        <View style={[styles.box, styles.lightBox]}>
          <AddPassButton
            variant={{ android: 'light-outline' }}
            onPress={handleAddPassButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightBox: {
    backgroundColor: '#e6e6e6',
  },
  darkBox: {
    backgroundColor: '#252525',
  },
});
