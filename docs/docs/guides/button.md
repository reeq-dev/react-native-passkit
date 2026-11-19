---
sidebar_position: 5
title: Add to Wallet button
---

# Add to Wallet button

`<AddPassButton />` renders the official, platform-native button:

- **iOS:** `PKAddPassButton` (**Add to Apple Wallet**).
- **Android:** the Google Wallet button asset.

```tsx
import { AddPassButton } from '@reeq/react-native-passkit';

<AddPassButton
  variant={{ ios: 'dark-outline', android: 'light' }}
  onPress={handleAddPass}
/>;
```

| Platform | Variants | Default |
| --- | --- | --- |
| iOS | `dark`, `dark-outline` | `dark-outline` |
| Android | `dark`, `light`, `light-outline` | `dark` |

## Size

The button has a default size: `260×60` on iOS and `288×44` on Android. Override it with `style`:

```tsx
import { Platform } from 'react-native';

<AddPassButton
  onPress={handleAddPass}
  style={{
    height: Platform.select({ android: 44, ios: 60 }),
    width: Platform.select({ android: 288, ios: 260 }),
  }}
/>;
```

Follow the brand guidelines for minimum sizes and clear space:

- [Apple Wallet identity guidelines](https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/)
- [Google Wallet brand guidelines](https://developers.google.com/wallet/generic/resources/brand-guidelines)
