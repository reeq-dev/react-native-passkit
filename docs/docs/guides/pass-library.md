---
sidebar_position: 3
title: Pass library (iOS)
---

# Pass library <span class="platform-badge">iOS</span> <span class="platform-badge">0.3.0+</span>

On iOS, your app can read and manage the Apple Wallet passes it issued, through [`PKPassLibrary`](https://developer.apple.com/documentation/passkit/pkpasslibrary).

:::caution[Entitlement required]
Your app only sees passes whose pass type identifier is in its **Wallet** entitlement. Without the entitlement, `getPasses()` returns an empty array. See [Installation → Wallet entitlement](../getting-started/installation.md#wallet-entitlement-pass-library-only).
:::

On Android, query functions return empty values (`[]`, `null`, `false`) and mutations reject with `E_UNSUPPORTED_PLATFORM`. See [Platform differences](./platform-differences.md).

## Availability

```ts
import { isPassLibraryAvailable } from '@reeq/react-native-passkit';

await isPassLibraryAvailable();
```

## List passes

```ts
import { getPasses } from '@reeq/react-native-passkit';

const passes = await getPasses();
for (const pass of passes) {
  console.log(pass.organizationName, pass.localizedName, pass.serialNumber);
}
```

Each item is a [`Pass`](../api/types.md#pass). Relevant dates are `Date` objects, and `userInfo` holds your custom `pass.json` data.

## Find one pass

```ts
import { getPass } from '@reeq/react-native-passkit';

const pass = await getPass('pass.com.example.ticket', 'SERIAL-123');
if (pass == null) {
  // not in Wallet, or not accessible to this app
}
```

## Read a field value

Read a field by the `key` it has in `pass.json`, localized for the user:

```ts
import { getPassFieldValue } from '@reeq/react-native-passkit';

const seat = await getPassFieldValue('pass.com.example.ticket', 'SERIAL-123', 'seat');
```

Date fields are returned as ISO‑8601 strings.

## Replace a pass

Replaces an existing pass (same pass type identifier and serial number) without showing any UI. Resolves `true` when the pass was replaced:

```ts
import { replacePass } from '@reeq/react-native-passkit';

const replaced = await replacePass(updatedBase64Pass);
```

:::tip
If your passes have a `webServiceURL`, Wallet updates them through your web service on its own. `replacePass` is for when your app already has the new version of the pass.
:::

## Remove a pass

```ts
import { removePass } from '@reeq/react-native-passkit';

await removePass('pass.com.example.ticket', 'SERIAL-123');
```

Rejects with `pass_not_found` when the pass doesn't exist or isn't accessible.

## Open a pass in Wallet

```ts
import { openPass } from '@reeq/react-native-passkit';

await openPass('pass.com.example.ticket', 'SERIAL-123');
```

## React to changes

See [`passLibraryChangedListener`](./events.md#pass-library-changes).
