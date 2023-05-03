# react-native-passkit

React native wrapper over google PayClient (for android) and PassKit (for iOS). Contains google and apple buttons

## Installation

```bash
$ npm install --save @reeq/react-native-passkit
# --- or ---
$ yarn add @reeq/react-native-passkit
```

and

```bash
$ pod install
```

## Usage

```js
import {
  AddPassButton,
  addPass,
  canAddPasses,
  containsPass,
} from '@reeq/react-native-passkit';

const handleAddPassButton = async () => {
  try {
    const pass = 'BASE_64_ENCODED_STRING';

    const isAddable = await canAddPasses();

    if (!isAddable) {
      return;
    }

    const hasPassAlready = await containsPass(pass);

    if (hasPassAlready) {
      return;
    }

    await addPass(pass);
  } catch (err) {
    console.log(err);
  }
};

<AddPassButton
  variant={{
    android: 'light',
    ios: 'dark-outline',
  }}
  onPress={handleAddPassButton}
/>;
```

## Components

### AddPassButton

#### Platform: iOS/Android

#### Type

```ts
type AndroidVariant = 'dark' | 'light' | 'light-outline';
type iOSVariant = 'dark' | 'dark-outline';

interface AddPassButtonProps extends ViewProps {
  variant?: {
    ios?: iOSVariant;
    android?: AndroidVariant;
  };
  onPress?: () => void;
}

type AddPassButton: React.FC<AddPassButtonProps>
```

#### Usage

```js
import { AddPassButton } from '@reeq/react-native-passkit';
import { Platform } from 'react-native';

//...

<AddPassButton
  variant={{
    android: 'light', // Default is 'dark'
    ios: 'dark', // Default is 'dark-outline'
  }}
  onPress={() => {
    console.log("I'm pressed");
  }}
  style={{
    height: Platform.select({
      android: 44,
      ios: 60,
    }),
    width: Platform.select({
      android: 288,
      ios: 260,
    }), // This style is default. Can be overriden
  }}
/>;
```

## API

### addPass()

#### Platform: iOS/Android

#### Type

```ts
type addPass = (base64EncodedPass: string) => Promise<void>;
```

#### Usage

```js
import { addPass } from '@reeq/react-native-passkit';

//...

await addPass('BASE_64_ENCODED_PASS');
```

### addPassJWT()

#### Platform: Android

#### Type

```ts
type addPassJWT = (passJWT: string) => Promise<void>;
```

#### Usage

```js
import { addPassJWT } from '@reeq/react-native-passkit';

//...

await addPassJWT('JWT_SIGNED_PASS');
```

### canAddPasses()

#### Platform: iOS/Android

#### Type:

```ts
type canAddPasses = () => Promise<boolean>;
```

#### Usage

```js
import { canAddPasses } from '@reeq/react-native-passkit';

//...

const canAdd = await canAddPasses();

console.log(canAdd); // true / false
```

### containsPass()

#### Platform: iOS

#### Type

```ts
type containsPass = (base64encodedPass: string) => Promise<boolean>;
```

#### Usage

```js
import { containsPass } from '@reeq/react-native-passkit';

//...

const hasPassInWallet = await containsPass('BASE_64_ENCODED_PASS');

console.log(hasPassInWallet); // true / false
```

### addPassResultListener()

#### Platform: iOS/Android

#### Type

```ts
type AddPassResultStatus = 'success' | 'cancelled' | 'error';

type AddPassResultErrorType = 'api' | 'unexpected';

interface AddPassResultEvent {
  status: AddPassResultStatus;
  errorType?: AddPassResultErrorType;
  message?: string;
}

type addPassResultListener = (
  callback: (event: AddPassResultEvent) => void
) => EmitterSubscription.remove;
```

#### Usage

```js
import { addPassResultListener } from '@reeq/react-native-passkit';
import { useEffect } from 'React';

//...

useEffect(() => {
  const unsubscribe = addPassResultListener((event) => {
    console.log(event); // { status: 'success' }
  });
  return () => {
    unsubscribe();
  };
}, []);
```

### useAddPassResult()

#### Platform: iOS/Android

#### Type

```ts
type AddPassResultStatus = 'success' | 'cancelled' | 'error';

type AddPassResultErrorType = 'api' | 'unexpected';

interface AddPassResultEvent {
  status: AddPassResultStatus;
  errorType?: AddPassResultErrorType;
  message?: string;
}

type useAddPassResult: () => AddPassResultEvent | undefined
```

#### Usage

```js
import { useAddPassResult } from '@reeq/react-native-passkit';

//...

const passAddResult = useAddPassResult();

console.log(passAddResult); // { status: "success" }
```

## How to create pass

### iOS

- [pass-js](https://github.com/tinovyatkin/pass-js) creating pass lib for node js

### Android

- [google-codelab](https://codelabs.developers.google.com/add-to-wallet-web#0) for node js

## Localization

### iOS

By default iOS add pass button does not support localization. To enable languages you want to support add them in XCode under <b>Localizations</b> list in the <b>Info</b> tab of the project. Button's localization will change automatically based on user phone setting's locale.

### Android

By default Android will apply localization for button with all [available](https://developers.google.com/wallet/legacy-resources/button-guidelines) languages. To restrict app to support only specific languages you need to do the following in <b>android/app/build.gradle</b>:

```gradle
android {

	//...

    defaultConfig {
    	//...

        resConfigs("en", "da", "uk") // restrict locale to English, Danish and Ukrainian
    }
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
