---
sidebar_position: 2
title: Quick start
---

# Quick start

```tsx
import {
  AddPassButton,
  addPass,
  addPassResultListener,
  canAddPasses,
  containsPass,
} from '@reeq/react-native-passkit';
import { useEffect } from 'react';

export function TicketScreen({ pass }: { pass: string }) {
  useEffect(
    () =>
      addPassResultListener((event) => {
        if (event.status === 'success') {
          console.log('Pass added');
        }
      }),
    []
  );

  const handleAddPass = async () => {
    // `pass` is a base64 encoded .pkpass (iOS) or Google Wallet JSON (Android).
    if (!(await canAddPasses())) {
      return;
    }
    if (await containsPass(pass)) {
      return; // Already in Apple Wallet (always false on Android)
    }
    await addPass(pass);
  };

  return (
    <AddPassButton
      variant={{ ios: 'dark-outline', android: 'primary' }}
      onPress={handleAddPass}
    />
  );
}
```

`addPass` resolves once the wallet UI is on screen, not when the user finishes. Use [`addPassResultListener`](../guides/events.md) or the `useAddPassResult` hook to find out whether the pass was added.
