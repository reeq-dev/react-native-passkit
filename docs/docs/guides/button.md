---
sidebar_position: 5
title: Add to Wallet button
---

# Add to Wallet button

`<AddPassButton />` renders the official, platform-native button:

- **iOS:** `PKAddPassButton` (**Add to Apple Wallet**).
- **Android:** Google's official **Add to Google Wallet** button, built from the [Android assets Google publishes](https://developers.google.com/wallet/generic/resources/brand-guidelines).

```tsx
import { AddPassButton } from '@reeq/react-native-passkit';

<AddPassButton
  variant={{ ios: 'dark-outline', android: 'primary' }}
  onPress={handleAddPass}
/>;
```

| Platform | Variants | Default |
| --- | --- | --- |
| iOS | `dark`, `dark-outline` | `dark` |
| Android | `primary`, `condensed` | `primary` |

On Android, Google only allows the **black** button, in two styles:

- `primary`: "Add to Google Wallet" on one line.
- `condensed`: the same text on two lines, for narrow layouts.

:::note Upgrading from the "Save to Google Pay" button
The Android variants `dark`, `light` and `light-outline` belong to the old **Save to Google Pay** button, which Google has retired. They still work, but all of them now render `primary`, and development builds log a deprecation warning. Switch to `primary` or `condensed`.
:::

## Size

Default sizes:

| | Default size |
| --- | --- |
| iOS | `260×60` |
| Android `primary` | `288×48` |
| Android `condensed` | `200×53` |

Override them with `style`. The artwork scales to fit and keeps its proportions:

```tsx
import { Platform } from 'react-native';

<AddPassButton
  onPress={handleAddPass}
  style={{
    height: Platform.select({ android: 48, ios: 60 }),
    width: Platform.select({ android: 288, ios: 260 }),
  }}
/>;
```

Follow the brand guidelines for sizing and clear space:

- [Apple Wallet identity guidelines](https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/)
- [Google Wallet brand guidelines](https://developers.google.com/wallet/generic/resources/brand-guidelines): at least 8dp of clear space on every side, and never smaller than the other buttons on the screen.
