---
sidebar_position: 1
title: Installation
---

# Installation

```bash
yarn add @reeq/react-native-passkit
```

or

```bash
npm install @reeq/react-native-passkit
```

## Requirements

:::info[New Architecture only]
Starting with `0.2.0` this library is a TurboModule and Fabric component, and it requires React Native's New Architecture. If your app still uses the legacy bridge, stay on `0.1.x`.
:::

| | Minimum |
| --- | --- |
| React Native | **0.76+** (the New Architecture is the default from 0.76) |
| New Architecture | **Required** (`newArchEnabled=true`) |
| iOS deployment target | **15.1+** |
| Android `minSdkVersion` | **24+** |
| Android `compileSdkVersion` | **34+** (the library compiles against 36) |
| Kotlin | **1.9+** |
| JDK | **17** |

Verified with React Native `0.85`.

## iOS

```bash
cd ios && pod install
```

### Wallet entitlement (pass library only)

Adding a pass needs no entitlement. Reading, replacing or removing passes ([Pass library](../guides/pass-library.md)) does. Your app can only see passes whose pass type identifier is listed in the **Wallet** capability:

1. In Xcode, open your target, go to **Signing & Capabilities**, add **+ Capability**, then choose **Wallet**.
2. Select the pass type IDs your app issues, or allow all pass types from your team.

This adds the `com.apple.developer.pass-type-identifiers` entitlement.

## Android

No extra steps. The module is autolinked, and it pulls in `com.google.android.gms:play-services-pay` automatically.

To issue passes you need a Google Wallet issuer account. See [Creating passes](../guides/creating-passes.md).
