---
sidebar_position: 7
title: Platform differences
---

# Platform differences

Apple Wallet and Google Wallet work in fundamentally different ways:

- **Apple Wallet keeps passes on the device.** An app can list, read, update and remove the passes it issued, through `PKPassLibrary`.
- **Google Wallet keeps passes on Google's servers.** On the device, an app can only *save* passes and check that saving is available. Listing, updating, expiring or removing passes is done from your backend with the [Google Wallet REST API](https://developers.google.com/wallet/reference/rest), and the changes sync to the user's device.

The library keeps one API across platforms and handles the gaps like this:

| Kind of method | Behaviour on the platform without support |
| --- | --- |
| Query (`containsPass`, `getPasses`, `getPass`, `getPassFieldValue`, `isPassLibraryAvailable`) | Resolves an empty value: `false`, `[]` or `null` |
| Mutation (`replacePass`, `removePass`, `openPass`) | Rejects with `code: 'E_UNSUPPORTED_PLATFORM'` |
| `addPassJWT` on iOS | Resolves and does nothing |
| `passLibraryChangedListener` on Android | Never fires |

```ts
import { removePass, UNSUPPORTED_PLATFORM } from '@reeq/react-native-passkit';

try {
  await removePass(typeId, serial);
} catch (e: any) {
  if (e.code === UNSUPPORTED_PLATFORM) {
    await api.expireGoogleWalletObject(serial); // do it server side
  }
}
```

## Not covered

These platform APIs are out of scope, because they need special entitlements or allowlisting, or belong to payments rather than passes:

- **Apple:** Apple Pay payments, payment and Secure Element card provisioning, identity verification (Verify with Wallet), car keys, shareable passes and FeliCa.
- **Google:** e-money cards and card tap events (allowlist only), Wear OS wallet intents, and Google Pay payments.
