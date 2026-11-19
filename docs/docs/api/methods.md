---
sidebar_position: 1
title: Methods
---

# Methods

All methods are named exports of `@reeq/react-native-passkit`.

## Cross-platform

### `canAddPasses(format?)`

```ts
canAddPasses(format?: PassFormat /* 'json' | 'jwt', default 'json' */): Promise<boolean>
```

Whether the device can add passes. On Android, `format` selects the Google Wallet API to check. iOS ignores it.

### `addPass(base64EncodedPass)`

```ts
addPass(base64EncodedPass: string): Promise<void>
```

Shows the wallet UI for one pass: a `.pkpass` on iOS, a JSON payload on Android. Resolves once the UI is presented. The outcome is reported by the [result event](../guides/events.md).

### `addPasses(base64EncodedPasses)` <span class="platform-badge">0.3.0+</span>

```ts
addPasses(base64EncodedPasses: string[]): Promise<void>
```

On iOS, shows one sheet for all passes. On Android, accepts exactly one JSON payload, which can itself contain several objects. See [Adding passes](../guides/adding-passes.md#add-several-passes-at-once).

### `getWalletName()` <span class="platform-badge">0.3.0+</span>

```ts
getWalletName(): Promise<string>
```

Returns `"Apple Wallet"` on iOS, and `"Google Wallet"` or `"Google Pay"` on Android, depending on the market.

## Android only

### `addPassJWT(passJWT)`

```ts
addPassJWT(passJWT: string): Promise<void>
```

Saves passes from a signed JWT. Does nothing on iOS.

## iOS only

On Android, queries resolve an empty value and mutations reject with `E_UNSUPPORTED_PLATFORM`.

### `isPassLibraryAvailable()` <span class="platform-badge">0.3.0+</span>

```ts
isPassLibraryAvailable(): Promise<boolean>
```

### `containsPass(base64EncodedPass)`

```ts
containsPass(base64EncodedPass: string): Promise<boolean>
```

### `getPasses()` <span class="platform-badge">0.3.0+</span>

```ts
getPasses(): Promise<Pass[]>
```

Passes the app can access. Requires the Wallet entitlement.

### `getPass(passTypeIdentifier, serialNumber)` <span class="platform-badge">0.3.0+</span>

```ts
getPass(passTypeIdentifier: string, serialNumber: string): Promise<Pass | null>
```

### `getPassFieldValue(passTypeIdentifier, serialNumber, fieldKey)` <span class="platform-badge">0.3.0+</span>

```ts
getPassFieldValue(
  passTypeIdentifier: string,
  serialNumber: string,
  fieldKey: string
): Promise<string | null>
```

The localized value of a `pass.json` field. Dates are returned as ISO‑8601 strings.

### `replacePass(base64EncodedPass)` <span class="platform-badge">0.3.0+</span>

```ts
replacePass(base64EncodedPass: string): Promise<boolean>
```

Replaces an existing pass without showing UI. Resolves `false` if it couldn't (for example, when the pass isn't in Wallet).

### `removePass(passTypeIdentifier, serialNumber)` <span class="platform-badge">0.3.0+</span>

```ts
removePass(passTypeIdentifier: string, serialNumber: string): Promise<void>
```

### `openPass(passTypeIdentifier, serialNumber)` <span class="platform-badge">0.3.0+</span>

```ts
openPass(passTypeIdentifier: string, serialNumber: string): Promise<void>
```

Opens the pass in the Wallet app.

## Events

### `addPassResultListener(callback)`

```ts
addPassResultListener(cb: (event: AddPassResultEvent) => void): () => void
```

### `useAddPassResult()`

```ts
useAddPassResult(): AddPassResultEvent | undefined
```

### `passLibraryChangedListener(callback)` <span class="platform-badge">iOS</span> <span class="platform-badge">0.3.0+</span>

```ts
passLibraryChangedListener(cb: (event: PassLibraryChangedEvent) => void): () => void
```

Listener functions return an unsubscribe function.

## Constants

### `UNSUPPORTED_PLATFORM`

`'E_UNSUPPORTED_PLATFORM'`: the `code` of the rejection when a method isn't available on the current platform.
