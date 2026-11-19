---
sidebar_position: 6
title: Localization
---

# Localization

## iOS

The iOS button is not localized until your app declares the languages it supports. In Xcode, add the languages under **Project → Info → Localizations**. The button then follows the user's locale.

## Android

The Google Wallet button ships in every language Google provides (about 60). It follows the app's locale, falling back to English. To keep only the languages your app supports, use `resConfigs` in `android/app/build.gradle`:

```groovy
android {
  defaultConfig {
    resConfigs "en", "da", "uk"
  }
}
```
