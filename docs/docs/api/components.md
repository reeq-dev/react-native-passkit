---
sidebar_position: 2
title: Components
---

# Components

## `AddPassButton`

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

Default size: `260×60` on iOS and `288×44` on Android. See the [button guide](../guides/button.md).
