---
sidebar_position: 1
title: Adding passes
---

# Adding passes

## Check support first

```ts
import { canAddPasses } from '@reeq/react-native-passkit';

const canAdd = await canAddPasses(); // JSON payloads
const canAddJwt = await canAddPasses('jwt'); // Android: checks the JWT API
```

- **iOS** returns `PKAddPassesViewController.canAddPasses()`. The `format` argument is ignored.
- **Android** asks Google Play services whether the save API for that payload format is available to this user and device. If you add passes with `addPassJWT`, check `'jwt'`.

:::note
On Android, `canAddPasses` can return `true` on a device with no Google account signed in. In that case Google Wallet closes immediately and the [result event](./events.md) reports `cancelled`.
:::

## Add a single pass

```ts
import { addPass } from '@reeq/react-native-passkit';

await addPass(base64EncodedPass);
```

| Platform | Payload |
| --- | --- |
| iOS | A signed `.pkpass` file, base64 encoded |
| Android | A Google Wallet JSON save payload (the unsigned body of a JWT), base64 encoded |

The promise resolves when the wallet UI is shown. Use the [result event](./events.md) to find out what the user did.

## Add several passes at once

<span class="platform-badge">0.3.0+</span>

```ts
import { addPasses } from '@reeq/react-native-passkit';

await addPasses([ticket1, ticket2, ticket3]);
```

- **iOS** shows a single Apple Wallet sheet with an **Add All** button (`PKAddPassesViewController(passes:)`).
- **Android:** Google Wallet saves several passes from **one** JSON payload, for example a `payload.eventTicketObjects` array with several entries. Pass a single base64 encoded JSON in the array. More than one entry rejects with `pass_error`.

## Add a pass from a JWT <span class="platform-badge">Android</span>

When your backend signs the save payload, send the JWT as is:

```ts
import { addPassJWT } from '@reeq/react-native-passkit';

await addPassJWT(signedJwt);
```

This does nothing on iOS.

## Skip passes that are already added <span class="platform-badge">iOS</span>

```ts
import { containsPass } from '@reeq/react-native-passkit';

if (!(await containsPass(base64EncodedPass))) {
  await addPass(base64EncodedPass);
}
```

On Android `containsPass` always resolves `false`. Track saved objects on your backend instead.

## Show the right wallet name <span class="platform-badge">0.3.0+</span>

```ts
import { getWalletName } from '@reeq/react-native-passkit';

const name = await getWalletName();
// iOS: "Apple Wallet". Android: "Google Wallet", or "Google Pay" in markets that still use that name.
```
