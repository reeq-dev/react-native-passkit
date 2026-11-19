# @reeq/react-native-passkit

React Native wrapper over Apple **PassKit** (Apple Wallet) and Google Wallet's **`PayClient`** (Android). It includes the native **Add to Apple Wallet** and **Google Wallet** buttons, and on iOS it can read and manage the passes already in Apple Wallet.

**📖 Documentation: https://reeq-dev.github.io/react-native-passkit/**

> **New Architecture only.** From `0.2.0` this library is a TurboModule + Fabric component and needs React Native 0.76+ with the New Architecture. On the legacy bridge, stay on `0.1.x`.

## Installation

```sh
yarn add @reeq/react-native-passkit
cd ios && pod install
```

Android is autolinked and needs no extra setup. See [Installation](https://reeq-dev.github.io/react-native-passkit/getting-started/installation) for requirements and the iOS Wallet entitlement.

## Quick start

```tsx
import {
  AddPassButton,
  addPass,
  canAddPasses,
  containsPass,
} from '@reeq/react-native-passkit';

const handleAddPass = async () => {
  const pass = 'BASE_64_ENCODED_PASS'; // .pkpass on iOS, Google Wallet JSON on Android

  if (!(await canAddPasses()) || (await containsPass(pass))) {
    return;
  }
  await addPass(pass);
};

<AddPassButton
  variant={{ ios: 'dark-outline', android: 'primary' }}
  onPress={handleAddPass}
/>;
```

## What's included

| | iOS | Android |
| --- | :-: | :-: |
| `AddPassButton` | ✅ | ✅ |
| `canAddPasses`, `addPass`, `addPasses`, `getWalletName` | ✅ | ✅ |
| `addPassJWT` | — | ✅ |
| `addPassResultListener`, `useAddPassResult` | ✅ | ✅ |
| `containsPass`, `getPasses`, `getPass`, `getPassFieldValue` | ✅ | — |
| `replacePass`, `removePass`, `openPass`, `passLibraryChangedListener` | ✅ | — |

Google Wallet has no on-device pass library, so the library management features are iOS-only. On Android those passes are managed from your backend through the Google Wallet REST API. See [Platform differences](https://reeq-dev.github.io/react-native-passkit/guides/platform-differences).

- [API reference](https://reeq-dev.github.io/react-native-passkit/api/methods)
- [Upgrading](https://reeq-dev.github.io/react-native-passkit/getting-started/upgrading)

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

The documentation site lives in [`docs/`](docs). Run it locally with `cd docs && yarn && yarn start`.

> The `0.2.0` New Architecture migration and the `0.3.0` API additions were written with the help of an AI assistant (Claude). If something looks off, please [open an issue](https://github.com/reeq-dev/react-native-passkit/issues).

## License

MIT
