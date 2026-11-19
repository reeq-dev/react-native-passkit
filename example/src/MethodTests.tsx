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
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/**
 * Test passes are git-ignored (they contain real issuer data). Drop your own
 * into example/src/test-pass-ios.ts (`export const iOSPass = '<base64 .pkpass>'`)
 * and/or example/src/test-pass-android.ts (`export const androidPassObject = {...}`).
 * `require` inside `try` makes them optional for Metro and TypeScript.
 */
let iOSPass = '';
let androidPassObject: object | undefined;
try {
  iOSPass = require('./test-pass-ios').iOSPass;
} catch {}
try {
  androidPassObject = require('./test-pass-android').androidPassObject;
} catch {}

// Identifiers of the iOS test pass. Change them to match your own pass.
const TYPE_ID = 'pass.com.brondby.tickets';
const SERIAL = '1063487';

const toBase64 = (s: string) =>
  btoa(
    encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
  );

/**
 * A well-formed Google Wallet save payload. With the placeholder issuer ID in
 * the sample object, Google Wallet rejects it with SAVE_ERROR, which exercises
 * the `api` error path end to end.
 */
const androidPass = androidPassObject
  ? toBase64(
      JSON.stringify({
        iss: 'test@example.com',
        aud: 'google',
        typ: 'savetowallet',
        payload: { genericObjects: [androidPassObject] },
      })
    )
  : '';

const pass = Platform.OS === 'ios' ? iOSPass : androidPass;

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
    await run('containsPass', () => containsPass(pass));
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
    if (Platform.OS === 'ios') {
      await run('addPassJWT (no-op)', () => addPassJWT('x'));
    }
    await run('addPasses([])', () => addPasses([]));
    await run('addPasses([a, b])', () => addPasses([pass, pass]));
    await run('addPass(not base64)', () => addPass('%%%'));
    await run('addPass(garbage)', () => addPass('bm90IGEgcGFzcw=='));
    await run('getPass(unknown)', () => getPass(TYPE_ID, 'unknown'));
    await run('removePass(unknown)', () => removePass(TYPE_ID, 'unknown'));
    await run('openPass(unknown)', () => openPass(TYPE_ID, 'unknown'));
    await run('replacePass', () => replacePass(pass));
  };

  const buttons: [string, () => Promise<unknown>][] = [
    ['Queries', runQueries],
    ['Errors', runErrors],
    ['addPass', () => run('addPass', () => addPass(pass))],
    ['addPasses', () => run('addPasses', () => addPasses([pass]))],
    [
      'addPassJWT',
      () =>
        run('addPassJWT', () =>
          // Unsigned placeholder token: Google Wallet should reject it.
          addPassJWT('eyJhbGciOiJub25lIn0.eyJ0eXAiOiJzYXZldG93YWxsZXQifQ.')
        ),
    ],
    [
      'addPass x2',
      async () => {
        await run('addPass #1', () => addPass(pass));
        await run('addPass #2 (while open)', () => addPass(pass));
      },
    ],
    ['replacePass', () => run('replacePass', () => replacePass(pass))],
    ['openPass', () => run('openPass', () => openPass(TYPE_ID, SERIAL))],
    ['removePass', () => run('removePass', () => removePass(TYPE_ID, SERIAL))],
    ['Clear', async () => setRows([])],
  ];

  return (
    <View style={styles.container}>
      {!pass && (
        <Text style={styles.rejected}>
          No test pass for {Platform.OS}. See the comment at the top of
          MethodTests.tsx.
        </Text>
      )}
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
