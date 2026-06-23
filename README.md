# @reeq/react-native-passkit

React Native wrapper over Google Wallet (`PayClient` on Android) and Apple `PassKit` (on iOS). Includes the native "Add to Apple Wallet" and "Save to Google Pay" buttons.

> **New Architecture only.** Starting with `0.2.0` this library is a TurboModule + Fabric component and requires React Native's New Architecture. The legacy bridge (Old Architecture) is no longer supported. If you are on the Old Architecture, stay on `0.1.x`.

> **Note on the `0.2.0` rewrite.** The migration from the Old Architecture to the New Architecture (TurboModule + Fabric) was done with the help of an AI assistant (Claude), not hand-written by the maintainer. It builds and runs, but mistakes can slip through — if you hit a bug or something looks off, please [open an issue](https://github.com/reeq-dev/react-native-passkit/issues) (or a PR). It's genuinely appreciated.

## Requirements

| | Minimum |
| --- | --- |
| React Native | **0.76+** (New Architecture is the default from 0.76) |
| New Architecture | **Required** (`newArchEnabled=true` / Fabric + TurboModules) |
| iOS deployment target | **15.1+** (inherited from React Native) |
| Android `minSdkVersion` | **24+** |
| Android `compileSdkVersion` | **34+** (the library compiles against 36) |
| Kotlin | **1.9+** (the library builds with 2.0.21) |
| JDK | **17** |

Verified against React Native `0.85`.

## Upgrading from 0.1.x to 0.2.0

**The public JavaScript/TypeScript API is unchanged** — `canAddPasses`, `addPass`, `addPassJWT`, `containsPass`, `<AddPassButton />`, `addPassResultListener`, and `useAddPassResult` keep the exact same signatures. For most apps the upgrade is just bumping the dependency and rebuilding; no code changes are required.

The only breaking change is the platform baseline: **`0.2.0` runs on the New Architecture only.**

1. **Be on React Native 0.76 or newer with the New Architecture enabled.** It is on by default from 0.76. If you explicitly disabled it, re-enable it:
   - Android — `android/gradle.properties`: `newArchEnabled=true`
   - iOS — reinstall pods with the New Architecture (default in 0.76+): `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`
2. **Android — raise `minSdkVersion` to at least 24** in `android/build.gradle` if you are lower. (It was 21 in `0.1.x`.) Make sure you build with JDK 17.
3. **iOS — bump your deployment target to 15.1+** if it is lower, then run `pod install`.
4. **Remove any manual native linking** for this package (old `react-native link` / manually added packages or pods). The module is autolinked on the New Architecture.
5. **Update the dependency and rebuild from scratch:**
   ```sh
   yarn add @reeq/react-native-passkit@^0.2.0
   # iOS
   cd ios && pod install && cd ..
   # clear Metro cache so the new view config is picked up
   yarn start --reset-cache
   ```

If you previously imported any internal/native module names directly (e.g. `NativeModules.PasskitModule`), switch to the public exports above — the underlying native module/component names changed for codegen and are not part of the public API.

## Installation

```sh
npm install @reeq/react-native-passkit
# --- or ---
yarn add @reeq/react-native-passkit
```

### iOS

```sh
cd ios && pod install
```

### Android

No extra steps — the module is autolinked. It depends on `com.google.android.gms:play-services-pay`, which is pulled in automatically.

## Usage

```tsx
import {
  AddPassButton,
  addPass,
  canAddPasses,
  containsPass,
} from '@reeq/react-native-passkit';

const handleAddPass = async () => {
  try {
    const pass = 'BASE_64_ENCODED_PASS';

    if (!(await canAddPasses())) {
      return;
    }

    if (await containsPass(pass)) {
      return;
    }

    await addPass(pass);
  } catch (err) {
    console.log(err);
  }
};

<AddPassButton
  variant={{ android: 'light', ios: 'dark-outline' }}
  onPress={handleAddPass}
/>;
```

## Components

### `AddPassButton`

**Platform:** iOS / Android

```ts
type AndroidVariant = 'dark' | 'light' | 'light-outline';
type IOSVariant = 'dark' | 'dark-outline';

interface AddPassButtonProps extends ViewProps {
  variant?: {
    ios?: IOSVariant; // default: 'dark-outline'
    android?: AndroidVariant; // default: 'dark'
  };
  onPress?: () => void;
}
```

The button ships with a default size (iOS `260×60`, Android `288×44`). Override it with `style`:

```tsx
import { AddPassButton } from '@reeq/react-native-passkit';
import { Platform } from 'react-native';

<AddPassButton
  variant={{ android: 'light', ios: 'dark' }}
  onPress={() => console.log("I'm pressed")}
  style={{
    height: Platform.select({ android: 44, ios: 60 }),
    width: Platform.select({ android: 288, ios: 260 }),
  }}
/>;
```

## API

### `addPass(base64EncodedPass: string): Promise<void>`

**Platform:** iOS / Android

```ts
import { addPass } from '@reeq/react-native-passkit';

await addPass('BASE_64_ENCODED_PASS');
```

### `addPassJWT(passJWT: string): Promise<void>`

**Platform:** Android (no-op on iOS)

```ts
import { addPassJWT } from '@reeq/react-native-passkit';

await addPassJWT('JWT_SIGNED_PASS');
```

### `canAddPasses(): Promise<boolean>`

**Platform:** iOS / Android

```ts
import { canAddPasses } from '@reeq/react-native-passkit';

const canAdd = await canAddPasses(); // true / false
```

### `containsPass(base64EncodedPass: string): Promise<boolean>`

**Platform:** iOS (resolves `false` on Android)

```ts
import { containsPass } from '@reeq/react-native-passkit';

const hasPassInWallet = await containsPass('BASE_64_ENCODED_PASS'); // true / false
```

### `addPassResultListener(callback): () => void`

**Platform:** iOS / Android

```ts
type AddPassResultStatus = 'success' | 'cancelled' | 'error';
type AddPassResultErrorType = 'api' | 'unexpected';

interface AddPassResultEvent {
  status: AddPassResultStatus;
  errorType?: AddPassResultErrorType;
  message?: string;
}

type addPassResultListener = (
  callback: (event: AddPassResultEvent) => void
) => () => void; // returns an unsubscribe function
```

```ts
import { addPassResultListener } from '@reeq/react-native-passkit';
import { useEffect } from 'react';

useEffect(() => {
  const unsubscribe = addPassResultListener((event) => {
    console.log(event); // { status: 'success' }
  });
  return unsubscribe;
}, []);
```

### `useAddPassResult(): AddPassResultEvent | undefined`

**Platform:** iOS / Android

A hook wrapper over `addPassResultListener`.

```ts
import { useAddPassResult } from '@reeq/react-native-passkit';

const passAddResult = useAddPassResult();

console.log(passAddResult); // { status: 'success' }
```

## How to create a pass

### iOS

- [pass-js](https://github.com/tinovyatkin/pass-js) — a pass creation library for Node.js

### Android

- [Google codelab](https://codelabs.developers.google.com/add-to-wallet-web#0)

## Localization

### iOS

By default the iOS add-pass button is not localized. To enable the languages you want to support, add them in Xcode under the **Localizations** list in the **Info** tab of the project. The button's localization changes automatically based on the user's locale.

### Android

By default Android applies localization for all [available](https://developers.google.com/wallet/legacy-resources/button-guidelines) languages. To restrict the app to specific languages, set `resConfigs` in `android/app/build.gradle`:

```gradle
android {
  defaultConfig {
    resConfigs "en", "da", "uk" // English, Danish, Ukrainian
  }
}
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
