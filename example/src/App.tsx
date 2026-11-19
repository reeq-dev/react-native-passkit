import {
  AddPassButton,
  addPass,
  addPassResultListener,
  canAddPasses,
  containsPass,
  getPasses,
  getWalletName,
  passLibraryChangedListener,
} from '@reeq/react-native-passkit';
import { useEffect, useState } from 'react';
import { MethodTests } from './MethodTests';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
// import { iOSPass } from './test-pass-ios';
// import { androidPass } from './test-pass-android';

export default function App() {
  const [walletName, setWalletName] = useState<string>();
  const [showTests, setShowTests] = useState(false);

  useEffect(() => {
    getWalletName().then(setWalletName);
    const unsubscribe = addPassResultListener((event) => {
      Alert.alert('Pass result listener', JSON.stringify(event));
    });
    const unsubscribeLibrary = passLibraryChangedListener((event) => {
      console.log('[pass library changed]', event);
    });
    return () => {
      unsubscribe();
      unsubscribeLibrary();
    };
  }, []);

  const handleListPasses = async () => {
    const passes = await getPasses();
    Alert.alert(
      `${passes.length} accessible pass(es)`,
      passes
        .map(
          (p) =>
            `${p.organizationName} · ${p.localizedName} (${p.serialNumber})`
        )
        .join('\n') || 'Add a pass type ID to the entitlements to see passes.'
    );
  };

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

  if (showTests) {
    return <MethodTests />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Method tests" onPress={() => setShowTests(true)} />
        <Text>Wallet: {walletName ?? '…'}</Text>
        {Platform.OS === 'ios' && (
          <Button title="List passes" onPress={handleListPasses} />
        )}
      </View>
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
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    alignItems: 'center',
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
