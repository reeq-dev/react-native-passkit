import {
  AddPassButton,
  addPass,
  addPassResultListener,
  canAddPasses,
  containsPass,
} from '@reeq/react-native-passkit';
import { useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
// import { iOSPass } from './test-pass-ios';
// import { androidPass } from './test-pass-android';

export default function App() {
  useEffect(() => {
    const unsubscribe = addPassResultListener((event) => {
      Alert.alert('Pass result listener', JSON.stringify(event));
    });
    return unsubscribe;
  }, []);

  const handleAddPass = async () => {
    try {
      // Replace with a real base64 encoded pass (iOS .pkpass / Android Wallet JSON).
      const pass = 'YOUR_BASE64_PASS';
      // const pass = androidPass;
      // const pass = iOSPass;

      const isAddable = await canAddPasses();
      if (!isAddable) {
        console.error("[can't add passes]");
        return;
      }

      const hasPassAlready = await containsPass(pass);
      if (hasPassAlready) {
        console.error('[has pass already]');
        return;
      }

      await addPass(pass);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.box, styles.lightBox]}>
        <AddPassButton onPress={handleAddPass} />
      </View>
      <View style={[styles.box, styles.darkBox]}>
        <AddPassButton
          variant={{ android: 'light', ios: 'dark-outline' }}
          onPress={handleAddPass}
        />
      </View>
      {Platform.OS === 'android' && (
        <View style={[styles.box, styles.lightBox]}>
          <AddPassButton
            variant={{ android: 'light-outline' }}
            onPress={handleAddPass}
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
