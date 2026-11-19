---
sidebar_position: 3
title: Types
---

# Types

All types are exported from `@reeq/react-native-passkit`.

## `PassFormat`

```ts
type PassFormat = 'json' | 'jwt';
```

## `AddPassResultEvent`

```ts
type AddPassResultStatus = 'success' | 'cancelled' | 'error';
type AddPassResultErrorType = 'api' | 'unavailable' | 'internal' | 'unexpected';

interface AddPassResultEvent {
  status: AddPassResultStatus;
  errorType?: AddPassResultErrorType; // Android only
  message?: string; // Android, with errorType 'api'
}
```

## `Pass`

An Apple Wallet pass (`PKPass`).

```ts
interface PassIdentifier {
  passTypeIdentifier: string;
  serialNumber: string;
}

interface Pass extends PassIdentifier {
  passType: 'barcode' | 'secureElement' | 'any';
  organizationName: string;
  localizedName: string;
  localizedDescription: string;
  passURL?: string; // opens the pass in Wallet
  webServiceURL?: string;
  authenticationToken?: string;
  deviceName: string;
  isRemotePass: boolean; // on a paired Apple Watch
  relevantDates: PassRelevantDate[];
  userInfo?: Record<string, unknown>;
}

interface PassRelevantDate {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}
```

On iOS 18 and later, `relevantDates` comes from `PKPass.relevantDates` and can contain intervals. On older versions it holds at most the single `relevantDate`.

## `PassLibraryChangedEvent`

```ts
interface PassLibraryChangedEvent {
  added: Pass[];
  replaced: Pass[];
  removed: PassIdentifier[];
}
```
