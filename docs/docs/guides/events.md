---
sidebar_position: 4
title: Events
---

# Events

## Add-pass result

`addPass`, `addPasses` and `addPassJWT` resolve when the wallet UI opens. The user's choice arrives as an event:

```ts
import { addPassResultListener } from '@reeq/react-native-passkit';

useEffect(
  () =>
    addPassResultListener((event) => {
      switch (event.status) {
        case 'success':
          break;
        case 'cancelled':
          break;
        case 'error':
          console.warn(event.errorType, event.message);
          break;
      }
    }),
  []
);
```

Or with the hook:

```ts
import { useAddPassResult } from '@reeq/react-native-passkit';

const result = useAddPassResult(); // AddPassResultEvent | undefined
```

### How the status is determined

- **iOS:** when the sheet closes, the library checks whether the pass library now contains the pass. If it does, the status is `success`. Otherwise it is `cancelled`. iOS never reports `error`.
- **Android:** the status comes from the Google Wallet activity result:

| Result code | `status` | `errorType` |
| --- | --- | --- |
| `RESULT_OK` | `success` | |
| `RESULT_CANCELED` | `cancelled` | |
| `SAVE_ERROR` | `error` | `api` (and `message` explains why) |
| `API_UNAVAILABLE` | `error` | `unavailable` |
| `INTERNAL_ERROR` | `error` | `internal` |
| anything else | `error` | `unexpected` |

## Pass library changes

<span class="platform-badge">iOS</span> <span class="platform-badge">0.3.0+</span>

Fires when passes your app can access are added, replaced or removed, whether by your app, the Wallet app or a server push update:

```ts
import { passLibraryChangedListener } from '@reeq/react-native-passkit';

useEffect(
  () =>
    passLibraryChangedListener(({ added, replaced, removed }) => {
      console.log(added.length, replaced.length, removed.length);
    }),
  []
);
```

`added` and `replaced` are [`Pass`](../api/types.md#pass) objects. `removed` only contains identifiers (`passTypeIdentifier`, `serialNumber`), because the pass no longer exists.

On Android the listener never fires, and the returned unsubscribe function does nothing.
