import {
  addPass,
  addPasses,
  addPassJWT,
  addPassResultListener,
  canAddPasses,
  containsPass,
  getPass,
  getPasses,
  getPassFieldValue,
  getWalletName,
  isPassLibraryAvailable,
  openPass,
  passLibraryChangedListener,
  removePass,
  replacePass,
} from '@reeq/react-native-passkit';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { iOSPass } from './test-pass-ios';

// Identifiers of the bundled test pass (see test-pass-ios.ts).
const TYPE_ID = 'pass.com.brondby.tickets';
const SERIAL = '1063487';

type Row = { name: string; ok: boolean; value: string };

const fmt = (v: unknown) => {
  if (v === undefined) return 'undefined';
  const s = JSON.stringify(v);
  return s.length > 160 ? `${s.slice(0, 160)}…` : s;
};

/**
 * Manual test harness for the example app: runs every public method and
 * prints the result (or rejection code) on screen.
 */
export function MethodTests() {
  const [rows, setRows] = useState<Row[]>([]);

  const log = (name: string, ok: boolean, value: unknown) =>
    setRows((r) => [...r, { name, ok, value: fmt(value) }]);

  const run = async (name: string, fn: () => Promise<unknown>) => {
    try {
      log(name, true, await fn());
    } catch (e: any) {
      log(name, false, `${e?.code ?? ''} ${e?.message ?? e}`);
    }
  };

  useEffect(() => {
    const a = addPassResultListener((e) => log('EVENT addPassResult', true, e));
    const b = passLibraryChangedListener((e) =>
      log('EVENT passLibraryChanged', true, {
        added: e.added.map((p) => p.serialNumber),
        replaced: e.replaced.map((p) => p.serialNumber),
        removed: e.removed.map((p) => p.serialNumber),
      })
    );
    return () => {
      a();
      b();
    };
  }, []);

  const runQueries = async () => {
    await run('canAddPasses()', () => canAddPasses());
    await run("canAddPasses('jwt')", () => canAddPasses('jwt'));
    await run('getWalletName', getWalletName);
    await run('isPassLibraryAvailable', isPassLibraryAvailable);
    await run('containsPass', () => containsPass(iOSPass));
    await run('getPasses', async () =>
      (await getPasses()).map((p) => `${p.serialNumber}/${p.passType}`)
    );
    await run('getPass', async () => {
      const p = await getPass(TYPE_ID, SERIAL);
      return (
        p && {
          org: p.organizationName,
          name: p.localizedName,
          desc: p.localizedDescription,
          url: p.passURL,
          dates: p.relevantDates,
          remote: p.isRemotePass,
        }
      );
    });
    await run('getPassFieldValue(seat)', () =>
      getPassFieldValue(TYPE_ID, SERIAL, 'seat')
    );
    await run('getPassFieldValue(missing)', () =>
      getPassFieldValue(TYPE_ID, SERIAL, 'nope')
    );
  };

  const runErrors = async () => {
    await run('addPassJWT (no-op)', () => addPassJWT('x'));
    await run('addPasses([])', () => addPasses([]));
    await run('addPass(garbage)', () => addPass('bm90IGEgcGFzcw=='));
    await run('getPass(unknown)', () => getPass(TYPE_ID, 'unknown'));
    await run('removePass(unknown)', () => removePass(TYPE_ID, 'unknown'));
    await run('openPass(unknown)', () => openPass(TYPE_ID, 'unknown'));
  };

  const buttons: [string, () => Promise<unknown>][] = [
    ['Queries', runQueries],
    ['Errors', runErrors],
    ['addPass', () => run('addPass', () => addPass(iOSPass))],
    ['addPasses', () => run('addPasses', () => addPasses([iOSPass]))],
    [
      'addPass x2',
      async () => {
        await run('addPass #1', () => addPass(iOSPass));
        await run('addPass #2 (while open)', () => addPass(iOSPass));
      },
    ],
    ['replacePass', () => run('replacePass', () => replacePass(iOSPass))],
    ['openPass', () => run('openPass', () => openPass(TYPE_ID, SERIAL))],
    ['removePass', () => run('removePass', () => removePass(TYPE_ID, SERIAL))],
    ['Clear', async () => setRows([])],
  ];

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        {buttons.map(([label, onPress]) => (
          <Pressable key={label} style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={styles.log}>
        {rows.map((r, i) => (
          <Text key={i} style={[styles.row, !r.ok && styles.rejected]}>
            {r.ok ? '✓' : '✗'} {r.name}: {r.value}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', padding: 6, gap: 6 },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  log: { flex: 1, paddingHorizontal: 8 },
  row: { fontSize: 11, fontFamily: 'Menlo', marginBottom: 4 },
  rejected: { color: '#b91c1c' },
});
