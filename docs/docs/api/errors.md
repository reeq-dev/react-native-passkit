---
sidebar_position: 4
title: Errors
---

# Errors

Rejected promises carry a `code`:

| Code | Platform | When |
| --- | --- | --- |
| `decode_error` | iOS, Android | The base64 string can't be decoded |
| `pass_error` | iOS, Android | The data is not a valid `.pkpass` (iOS) or Google Wallet JSON object (Android). `addPasses` received an empty array. Android: `addPasses` received more than one entry |
| `presentation_error` | iOS, Android | An add-pass sheet (iOS) or Google Wallet save flow (Android) is already open, or a view controller transition is in progress (iOS) |
| `window_error` | iOS | No key window or top view controller to present from |
| `vc_error` | iOS | `PKAddPassesViewController` couldn't be created |
| `pass_not_found` | iOS | `removePass` / `openPass`: no accessible pass with that ID and serial |
| `open_error` | iOS | Wallet couldn't open the pass URL |
| `activity_error` | Android | No current Activity to launch Google Wallet from |
| `save_error` | Android | Google Play services threw while starting the save flow |
| `E_UNSUPPORTED_PLATFORM` | iOS, Android | The method isn't available on this platform |

Errors that happen **after** the wallet UI has opened are reported through the [add-pass result event](../guides/events.md), not as a rejection.
