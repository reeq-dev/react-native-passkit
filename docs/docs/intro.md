---
slug: /
sidebar_position: 1
title: Introduction
---

# React Native PassKit

`@reeq/react-native-passkit` adds wallet passes to React Native apps:

- **iOS**: Apple [PassKit](https://developer.apple.com/documentation/passkit/wallet) (Apple Wallet).
- **Android**: Google Wallet through the Google Play services [`PayClient`](https://developers.google.com/android/reference/com/google/android/gms/pay/PayClient).

It ships the native **Add to Apple Wallet** and **Google Wallet** buttons, functions to add passes, and on iOS, functions to read and manage the passes already in Apple Wallet.

## Features

| Feature | iOS | Android |
| --- | :-: | :-: |
| Native add-pass button | ✅ | ✅ |
| Check that the device can add passes | ✅ | ✅ |
| Add a pass | ✅ `.pkpass` | ✅ JSON |
| Add several passes at once | ✅ | ✅ (one JSON payload) |
| Add a pass from a signed JWT | — | ✅ |
| Add-pass result event | ✅ | ✅ |
| Wallet app name | ✅ | ✅ |
| Check whether a pass is in Wallet | ✅ | — |
| List, read, replace, remove and open passes | ✅ | — |
| Pass library change event | ✅ | — |

The empty Android cells aren't missing work. Google Wallet has no on-device pass library: passes are stored on Google's servers and managed from your backend with the [Google Wallet REST API](https://developers.google.com/wallet/reference/rest). See [Platform differences](./guides/platform-differences.md).

## Next steps

- [Install the library](./getting-started/installation.md)
- [Add your first pass](./getting-started/quick-start.md)
- [Browse the API](./api/methods.md)
