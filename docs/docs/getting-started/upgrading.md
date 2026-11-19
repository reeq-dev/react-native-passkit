---
sidebar_position: 3
title: Upgrading
---

# Upgrading

## 0.2.x → 0.3.0

All additions are backwards compatible. Changes in behaviour you might notice:

- **Android `addPass` / `addPassJWT` now reject** with `activity_error` when there is no current Activity, `decode_error` when the base64 can't be decoded, and `pass_error` when the payload isn't a JSON object. Before, they silently resolved without showing anything, or launched Google Wallet with a payload it could only reject.
- **A second add call while the wallet UI is open now rejects with `presentation_error`** on both platforms, instead of stacking another sheet or save flow.
- **Android `canAddPasses()` no longer returns `false` before the first `onResume`.** The Google Wallet client is now created lazily.
- **Android add-pass result events can report two new error types**: `unavailable` (`API_UNAVAILABLE`) and `internal` (`INTERNAL_ERROR`). Before, both were reported as `unexpected`. If you exhaustively `switch` over `AddPassResultErrorType`, add the two cases.

- **The Android button is now Google's "Add to Google Wallet" button**, replacing the retired "Save to Google Pay" artwork. Google only allows the black button, in a `primary` or `condensed` style. The old `dark`, `light` and `light-outline` variants still work, but they render `primary` and log a warning in development. The default Android height changed from 44 to 48, to match Google's layout.

New APIs: `addPasses`, `canAddPasses(format)`, `getWalletName`, `isPassLibraryAvailable`, `getPasses`, `getPass`, `getPassFieldValue`, `replacePass`, `removePass`, `openPass` and `passLibraryChangedListener`.

## 0.1.x → 0.2.0

**The public JavaScript API is unchanged.** The only breaking change is the platform baseline: `0.2.0` runs on the New Architecture only.

1. **Use React Native 0.76 or newer with the New Architecture enabled.** It is on by default from 0.76. If you turned it off, turn it back on:
   - Android: in `android/gradle.properties`, set `newArchEnabled=true`.
   - iOS: run `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`.
2. **Android:** raise `minSdkVersion` to at least 24, and build with JDK 17.
3. **iOS:** raise the deployment target to 15.1 or higher, then run `pod install`.
4. **Remove any manual native linking** for this package. The module is autolinked.
5. **Rebuild from scratch:**

```bash
yarn add @reeq/react-native-passkit@^0.2.0
cd ios && pod install && cd ..
yarn start --reset-cache
```

If you imported internal native module names directly (for example `NativeModules.PasskitModule`), switch to the public exports.
