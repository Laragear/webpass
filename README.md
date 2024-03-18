# Webpass

[![npm version](https://badge.fury.io/js/@laragear%2Fwebpass.svg)](https://badge.fury.io/js/@laragear%2Fwebpass)
[![codecov](https://codecov.io/gh/Laragear/webpass/graph/badge.svg?token=UlHjKBjZhg)](https://codecov.io/gh/Laragear/webpass)
[![Last stable run](https://github.com/Laragear/webpass/actions/workflows/test.yaml/badge.svg)](https://github.com/Laragear/webpass/actions/workflows/test.yaml)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=Laragear_webpass&metric=alert_status)](https://sonarcloud.io/dashboard?id=Laragear_webpass)

The most simple WebAuthn (Passkeys) helper for browsers.

```js
import Webpass from '@laragear/webpass'

const { user, success } = await Webpass.assert()

if (success) {
    return `Welcome ${user.name}!`
}
```

## Become a sponsor

[![](.github/assets/support.png)](https://github.com/sponsors/DarkGhostHunter)

Your support allows me to keep this package free, up-to-date and maintainable. Alternatively, you can **[spread the word!](http://twitter.com/share?text=I%20am%20using%20this%20cool%20PHP%20package&url=https://github.com%2FLaragear%2FJson&hashtags=PHP,Laravel)**

## Requirements

* A working browser

## Installation

Use your favorite package manager to install it in your project.

```shell
npm i @laragear/webpass
```

```shell
pnpm i @laragear/webpass
```

```shell
yarn add @laragear/webpass
```

```shell
bum @laragear/webpass
```

Then, in your project, you can import is as a module.

```js
import Webpass from "@laragear/webpass"
```

If you're not using a bundler like Webpack, Rollup, Parcel, or any other, you may prefer to use a CDN directly into your HTML web page, like using [JSDelivr](https://cdn.jsdelivr.net/npm/@laragear/webpass@latest/dist/webpass.js) or [unpkg](https://unpkg.com/@laragear/webpass@latest/dist/webpass.js).

```html
<script src="https://cdn.jsdelivr.net/npm/@laragear/webpass@2/dist/webpass.js" defer></script>

<script>
    const assert = async () => await Webpass.assert("/auth/assert-options", "/auth/assert")
</script>

<button type="button" onclick="assert()">
    Log in
</button>
```

Alternatively, you may also use the `webpass.mjs` if you're using [ECMAScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) in your project.

```html
<script type="module" async>
import Webpass from "https://cdn.jsdelivr.net/npm/@laragear/webpass@1/dist/webpass.mjs"

Window.assert = async () => await Webpass.assert("/auth/assert-options", "/auth/assert")
</script>

<button type="button" onclick="assert()">
    Log in
</button>
```

## Usage

First, you should check if the browser supports WebAuthn (also called _Passkeys_) and [user verification](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential/isUserVerifyingPlatformAuthenticatorAvailable_static). You can easily do it with `isSupported()` and `isUnsupported()`.

```js
import Webpass from "@laragear/webpass"

if (Webpass.isSupported()) {
    return "Your browser supports WebAuthn, just click Login and you're done!"
}

if (Webpass.isUnsupported()) {
    return "Your browser doesn't support WebAuthn."
}
```

> [!WARNING]
>
> These functions check if WebAuthn is supported, and also if user verification (TouchID, FaceID, Windows Hello, fingerprint, PIN or else) is supported. If the user cannot be verified, WebAuthn should be considered unsupported.
>
> In these cases, **consider the context as insecure**.

After verifying the device, you're free to use Webpass.

The most straightforward way to use Webpass is to execute `Webpass.attest()` and `Webpass.assert()` to create and verify credentials, respectively.

```js
import Webpass from "@laragear/webpass"

// Create new credentials for a logged in user
const { credential, success, error } = await Webpass.attest("/auth/attest-options", "/auth/attest")

// Check the credentials for a logged out user
const { user, success, error } = await Webpass.assert("/auth/assert-options", "/auth/assert")

// Or login with some data to fetch the correct credentials for the user:
const { user, success, error } = await Webpass.assert({
    path: "/auth/assert-options",
    body: {
        email: document.getElementById("email").value
    }
})
```

There is a lot of assumptions with the simple approach:

- It uses the site host as the base URL.
- Includes credentials (Cookies, Bearer Token) as long these are in the same domain ("same-origin").
- Uses JSON headers (`Content-type` and `Accept` as `application/json`)

You may also change the ceremony paths by your custom one.

```js
import Webpass from "@laragear/webpass"

// Register credentials:
const { credential, success, error } = await Webpass.attest(
    "/webauthn/attest/options", "/webauthn/attest"
)

// Login with credentials:
const { user, success, error, pending } = await Webpass.assert(
    "/webauthn/attest/options", "/webauthn/assert"
)
```

Of course, this may be too simple for your use case. Luckily, you can use a custom configuration for both ceremonies through objects, or even use a [global configuration](#configuration).

### Attestation

Attestation is the _ceremony_ to create credentials. In a nutshell, the browser retrieves _how_ to create a credential from the server, creates it (as a private key), and the server receives the generated public key to store.

Start an attestation using `attest()`, with the paths where the attestation options are retrieved, and the attestation response is sent back.

```js
import Webpass from "@laragear/webpass"

const { success, data, error } = await Webpass.attest("/auth/attest-options", "/auth/attest")
```

The attestation object contains:

- `success`, if the attestation was successful
- `data`, the data received from the successful attestation
- `error`, if the attestation was unsuccessful by an error

While the `data` object will contain the response from the attestation server, most servers won't return body content on `HTTP 201` or `HTTP 201` codes. Others will return the ID of the credential created for redirection (like `126` or a UUID). For that matter, you can use the `credential` alias, or the `id` alias if you want to extract only the ID or UUID property.

```js
import Webpass from "@laragear/webpass"

const { id, success, error } = await Webpass.attest("/auth/attest-options", "/auth/attest")

if (success) {
    return navigateTo(`/profile/devices/${id}`)
}

throw error
```

### Assertion

Assertion is the _ceremony_ to check if a device has the correct credential. In a nutshell, the authenticator asks the server for a challenge through the browser, the authenticator resolves that challenge with the private key, and the server checks the resolved challenge is correct.

Start an assertion using the `assert()` method, with the paths where the assertion options are retrieved, and the assertion response is sent back.

```js
import Webpass from "@laragear/webpass"

const { success, data, error } = await Webpass.assert("/auth/assert-options", "/auth/assert")
```

The assertion object contains:

- `success`, if the attestation was successful
- `data`, the data received from the attestation
- `error`, if the attestation was unsuccessful by an error

The first request to the server is the most important. If your server instructed the authenticator to create [discoverable credentials](https://www.w3.org/TR/webauthn-2/#enum-residentKeyRequirement) (called "Resident Keys") in the device, you won't need anything more than the path to receive the assertion options as the device will automatically find the correct one.

Otherwise, you may need to point out the user identifier, like its email. This way the server can find the Credentials IDs for the user, so the Authenticator can pick up the correct Non-Resident Key to authenticate. For that, you may [configure the ceremony](#ceremony-configuration) with a body your server can pick up.

```js
import Webpass from "@laragear/webpass"

const { data, success, error } = await Webpass.assert({
    path: "/auth/assert-options",
    body: {
        // The email allows the server to show the registered key IDs
        // the authenticator should use to complete the ceremony.
        email: document.getElementById('user-email').value,
    }
}, "/auth/attest")
```

Then, your server should be able to identify the user and return the IDs of the expected Credentials IDs to complete the Assertion ceremony.

> [!IMPORTANT]
>
> It will depend on your server to find the ID of the keys for the user identifier received. For example, we can use the `email` to find the user and its credentials, and then push a proper WebAuthn response with their information. Others may use the `username` or a given number.

Usually, the servers will complete the Assertion ceremony by retuning the user, a token, or even custom JSON with both. You may use the `user` alias, or use `token` if the response is a single string for further authentication.

```js
import Webpass from "@laragear/webpass"
import { useAuth } from '#/composables'

const { user, success, error } = await Webpass.assert()

if (success) {
    return `Welcome, ${user.name}!`
}
```

### Ceremony configuration

Both Attestation and Assertion ceremonies require two requests to the server: one asking for the "options" (instructions), and the second where the browser checks everything is alright.

For example, there may be scenarios where you will want to add data to one of these requests, or both. You may add additional data to the server requests using an object with the endpoint name, the headers, the body, and if the fetch should include credentials (like cookies or header tokens), through an object. All of these options are forwarded to [ofetch](#oh-my-fetch).

This works for both Attestation and Assertion, and available for both requests of each ceremony.

```js
import Webpass from "@laragear/webpass"

const attestOptionsConfig = {
    path: "/auth/attest-options",
    headers: {
        "X-Auth-Type": "WebAuthn"
    },
    credentials: "include",
}

const attestConfig = {
    path: "/auth/attest",
    headers: {
        "X-Auth-Type": "WebAuthn"
    },
    credentials: "include",
    body: {
        name: document.getElementById("credential-name").value
    }
}

const { data, success, error } = await Webpass.attest(attestOptionsConfig, attestConfig)
```

### Raw ceremonies

You may want to use `try-catch` blocks, or receive the raw data from the server on success. You can do that using the `attestRaw()` and `assertRaw()` methods.

```js
import Webpass from "@laragear/webpass"

let data = null

try {
    data = await Webpass.assertRaw("/auth/attest")
} catch (e) {
    alert("Something didn't work. Check your device and try again!")

    console.error(e)
}
```

### Oh my fetch

Webpass uses [Oh My Fetch](https://unjs.io/packages/ofetch) library to push requests and receive responses from the server during WebAuthn ceremonies. You may push your custom configuration for the `ofetch` helper directly when creating a Webpass instance from scratch.

```js
import Webpass from "@laragear/webpass"

const webpass = Webpass.create({
    baseURL: 'https://myapp.com/passkeys',
    retry: 3,
    retryDelay: 500,
    onResponse: ({ response }) => console.debug(response),
})

const result = webpass.assert()
```

You may also pass `ofetch` configuration in a case-by-case-basis for attestation and assertion options and responses.

```js
import Webpass from "@laragear/webpass"

const assert = Webpass.assert(
    {
        // ...
        path: "/auth/assert-options",
        retry: 5,
        retryDelay: 1000,
        onResponse: ({ response }) => console.debug(response)
    },
    {
        // ...
        path: "/auth/assert",
        retry: 0,
        onResponse: ({ response }) => console.debug(response)
    })
```

## Serialization

The credential is transmitted as JSON, but some parts of it are _not_ JSON friendly. Until [WebAuthn Level 3 comes](https://w3c.github.io/webauthn/#sctn-parseCreationOptionsFromJSON), this library will automatically encode/decode binary data as BASE64 URL safe strings (also known as "websafe" BASE64) and viceversa.

This also allows the server to recover the data easily, independently of the language, from a BASE64 URL string.

## Configuration

Webpass always instances itself with a default configuration that should work on most scenarios.

You can create a custom instance with a custom configuration to ease the usage of attestations and assertions on multiple endpoints, or just to slim down your login/register views. All the keys, except the `routes` key, are pushed to [Oh My Fetch](https://unjs.io/packages/ofetch).

```js
import Webpass from "@laragear/webpass"

const webpass = Webpass.create({
    method: "post",
    redirect: "error",
    baseURL: undefined,
    routes: {
        attestOptions: "/auth/attest-options",
        attest: "/auth/attest",
        assertOptions: "/auth/assert-options",
        assert: "/auth/assert",
    },
    findCsrfToken: false,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "same-origin",
})

// Create an attest in other part of the application, as the proper path and config are already loaded.
const { credential, success, error } = await webpass.attest()
```

## Using with Nuxt

You can easily create a lazy WebAuthn ceremony using `useLazyAsyncData`, and the `raw` method of Webpass.

```vue
<template>
  <div v-if="isSupported">
    <button @click="login" :disabled="status === 'pending'">Login</button>

    <div v-if="error">
      Something happened:
      <pre v-html="error" />
    </div>
  </div>

  <div v-else>
    Your browser and device doesn't support WebAuthn or Passkeys.
  </div>
</template>

<script setup>
import Webpass from "@laragear/webpass"

const isSupported = Webpass.isSupported()

const { data, status, error, execute: login } = useLazyAsyncData('webauthn:assert', () => {
    return Webpass.assert()
}, {
    immediate: false
})
</script>
```

## CSRF / XSRF token

> [!TIP]
>
> Theoretically, there is no need to use [CSRF or XSRF token](https://laravel.com/docs/10.x/csrf) for WebAuthn ceremonies. As credentials are mapped to a domain, trying to make a cross-request to an external domain will render them invalid.
>
> It's recommended to **disable CSRF/XSRF token verification** on WebAuthn routes.

If you're receiving `TokenMismatchException` (`HTTP 419`) error responses from the server, you can let Webpass find a CSRF or XSRF token automatically by setting `findCsrfToken` to `true` in the configuration.

```js
import Webpass from "@laragear/webpass"

const webpass = Webpass.create({
    findCsrfToken: true,
})

const { success } = await webpass.attest()
```

This will allow Webpass to search in your document `<meta>` tags, `<input>` tags, or cookies (in that order) for a CSRF or XSRF token. If none is found, an error will be thrown.

Alternatively, you may set the token manually if you have direct access to it.

```js
import Webpass from "@laragear/webpass"

const webpass = Webpass.create({
    findCsrfToken: 'U9qhszdZCPQJTyhXTBD3qGB+SFQreARqSc8CNOML',
})

const { success } = await webpass.attest()
```

## Autofill Passkey

You may enable a "Conditional UI" served automatically by the browser to pick the correct Passkeys.

In a nutshell, you can show a prompt the moment the user interacts with a login box by retrieving the Assertion Options from the server when the page loads. The assertion will be pending in the background until the user intervenes.

To check if the browser supports Conditional UI before doing it, use the `isAutofillable()` function, and then set `useAutofill` as `true` in any of the assertion configurations, or by [creating a new instance](#ceremony-configuration).

```html
<script>
import Webpass from "@laragear/webpass"

if (await Webpass.isAutofillable()) {
    const { success } = await Webpass.assert({
        useAutofill: true
    })

    if (success) {
        window.location.replace('/dashboard')
    }
}
</script>

<form>
    <!-- Important to set "webauthn" last in the autocomplete section -->
    <input type="text" name="username" autocomplete="username webauthn">
    <input type="password" name="password" autocomplete="password">
</form>
```

> [!INFO]
>
> More information about how to implement Conditional UI in [web.dev](https://web.dev/articles/passkey-form-autofill).

## Debugging

During development, you may want to check if your application attests and asserts correctly with different authenticators. This package automatically calls `console.debug()` for both ceremonies, so you can find in your browser console the data being moved between the authenticator and your application.

Enabling debug messages in your console would yield entries like this:

    [Assertion Credentials Retrieved]
      {
        challenge: '2CsMvjganOUnbMyt3XIHS0k-X2HdeCmM6u60weOxJaLOBNmn7BwA47LAqX6ETWO0Xw-VfX72XOFXczkvTipXeg',
        timeout: 60000,
        rpId: 'webauthn.com',
        allowCredentials: [
          {
            id: 'OMR2xF8KLNYj40-5k_O-_m6vSur2FGJL1gkg_315NGU',
            type: 'public-key',
            transports: ['usb']
          }
        ],
        userVerification: 'preferred'
      }

    [Assertion benchmark]
      1 minute, 23 seconds.

## FAQ

* **Does this store user credentials?**

No, this is an WebAuthn API helper for browsers. It's your server the responsible to store and check credentials.

* **Can I use this on a plain HTML page?**

Yes, import it as a script in your HTML `<header>` tag.

```html
<head>
    <!-- ... -->
    <script src="https://cdn.jsdelivr.net/npm/@laragear/webpass@2/dist/webpass.js" defer></script>
</head>
```

* **Hey, this doesn't work!**

Check your browser's Console for any errors. Most of the time, errors come up from the server or the authenticator.

* **Can I serialize the Credentials in another format, like a giant BASE64 string?**

No. This library works over JSON for communicating between the server and the browser. Binary strings (`ArrayBuffers`) are automatically transformed into BASE64 URL strings.

WebAunthn 3.0 _may_ include automatic serialization and deserialization.

* **I get `TokenMismatch` HTTP 419 errors in my app. What I'm doing wrong?**

If you're using Laravel, check there is a [CSRF or XSRF token](https://laravel.com/docs/10.x/csrf) in your `<meta>` tags, `<input>` tags, or cookies.

* **I get `The token must be an CSRF (40 characters) or XSRF token` in the console every time I try to use Webpass!**

It's because Webpass its trying (and failing) to find a valid token. You may [issue your own](#csrf--xsrf-token), or [disable it all together](#csrf--xsrf-token).

* **How do I enable debug messages?**

By default, browsers don't show debug messages in the Console. To enable that, enable/raise messages levels to "debug". Usually that option is shown as "Levels" or "Filters" on the top of the console pane.

* **How do I decode the BASE64 URL strings incoming to the server?**

That depends on your server app and language which is written. Take this TypeScript example:

```typescript
import { Assert } from 'some-webauthn-library'
import { Auth } from 'some-auth-library'

/**
 * Decode a BASE64 URL Safe string into an ArrayBuffer
 */
function decodeBase64(input: string): Uint8Array {
    input = (input + "=".repeat((4 - input.length % 4) % 4))
        .replace(/-/g, "+")
        .replace(/_/g, "/")

    return new TextEncoder().encode(input)
}

function assert(request: object): boolean {
    for (key in Object.keys(request.response)) {
        request.response[key] = decodeBase64(request.response[key])
    }

    const { user, success } = Assert(request)

    return success && Auth.login(user)
}
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
