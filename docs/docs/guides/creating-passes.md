---
sidebar_position: 2
title: Creating passes
---

# Creating passes

This library adds passes to the wallet. Creating and signing them happens on your server.

## Apple Wallet (`.pkpass`)

A `.pkpass` is a signed zip archive containing `pass.json`, images and a manifest. You need a **Pass Type ID** and its certificate from the Apple Developer portal.

- [Apple: Wallet Passes](https://developer.apple.com/documentation/walletpasses)
- [pass-js](https://github.com/tinovyatkin/pass-js): create passes with Node.js
- To update passes after they are added, implement the [web service](https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes) referenced by `webServiceURL`.

Send the file to the app base64 encoded and pass the string to `addPass`.

## Google Wallet

Google Wallet passes are made of a **class** (shared template) and an **object** (one per user). Both are created through the Google Wallet API with an issuer account.

- [Google Wallet developer docs](https://developers.google.com/wallet)
- [Codelab: Add to Google Wallet](https://codelabs.developers.google.com/add-to-wallet-web)

Give the app one of the following:

- the **JSON** save payload (same shape as the JWT body, unsigned), base64 encoded, for `addPass`, or
- a **signed JWT**, for `addPassJWT`.
