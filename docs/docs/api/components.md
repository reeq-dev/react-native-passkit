---
sidebar_position: 2
title: Components
---

# Components

## `AddPassButton`

```ts
type AndroidVariant =
  | 'primary'
  | 'condensed'
  | 'dark' // deprecated, renders 'primary'
  | 'light' // deprecated, renders 'primary'
  | 'light-outline'; // deprecated, renders 'primary'
type IOSVariant = 'dark' | 'dark-outline';

interface AddPassButtonProps extends ViewProps {
  variant?: {
    ios?: IOSVariant; // default: 'dark'
    android?: AndroidVariant; // default: 'primary'
  };
  onPress?: () => void;
}
```

Default size: `260×60` on iOS, and `288×48` (`primary`) or `200×53` (`condensed`) on Android. See the [button guide](../guides/button.md).
