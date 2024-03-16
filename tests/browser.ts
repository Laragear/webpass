import {beforeEach, describe, expect, test, vi} from "vitest"
import {
    isSupported,
    isNotSupported,
    isUnsupported,
    isAutofillable,
    isNotAutofillable,
    isPlatformAuthenticator,
    isNotPlatformAuthenticator
} from "../src/browser"
import {browserSupportsWebAuthn} from "@simplewebauthn/browser";

beforeEach(() => {
    vi.restoreAllMocks();
});

const mocks = vi.hoisted(() => {
    return {
        browserSupportsWebAuthn: true,
        browserSupportsWebAuthnAutofill: true,
        platformAuthenticatorIsAvailable: true,
    }
})

vi.mock('@simplewebauthn/browser', () => {
    return {
        browserSupportsWebAuthn: () => mocks.browserSupportsWebAuthn,
        browserSupportsWebAuthnAutofill: async () => mocks.browserSupportsWebAuthnAutofill,
        platformAuthenticatorIsAvailable: async () => mocks.platformAuthenticatorIsAvailable,
    }
})

describe('Browser Support tests', () => {

    test('true if supported', async () => {
        mocks.browserSupportsWebAuthn = true

        expect(await isSupported()).toBe(true)
        expect(await isNotSupported()).toBe(false)
        expect(await isUnsupported()).toBe(false)
    })

    test('false if not supported', async () => {
        mocks.browserSupportsWebAuthn = false

        expect(await isSupported()).toBe(false)
        expect(await isNotSupported()).toBe(true)
        expect(await isUnsupported()).toBe(true)
    })
})

describe('Browser autofill', () => {
    test('true when supported and autofillable', async () => {
        mocks.browserSupportsWebAuthn = true
        mocks.browserSupportsWebAuthnAutofill = true

        expect(await isAutofillable()).toBe(true)
        expect(await isNotAutofillable()).toBe(false)
    })

    test('false when not supported and autofillable', async () => {
        mocks.browserSupportsWebAuthn = false
        mocks.browserSupportsWebAuthnAutofill = true

        expect(await isAutofillable()).toBe(false)
        expect(await isNotAutofillable()).toBe(true)
    })

    test('false when supported and not autofillable', async () => {
        mocks.browserSupportsWebAuthn = true
        mocks.browserSupportsWebAuthnAutofill = false

        expect(await isAutofillable()).toBe(false)
        expect(await isNotAutofillable()).toBe(true)
    })
});

describe('Browser platform authenticator', () => {
    test('true when supported and platform authenticator', async () => {
        mocks.browserSupportsWebAuthn = true
        mocks.platformAuthenticatorIsAvailable = true

        expect(await isPlatformAuthenticator()).toBe(true)
        expect(await isNotPlatformAuthenticator()).toBe(false)
    })

    test('false when not supported and platform authenticator', async () => {
        mocks.browserSupportsWebAuthn = false
        mocks.platformAuthenticatorIsAvailable = true

        expect(await isPlatformAuthenticator()).toBe(false)
        expect(await isNotPlatformAuthenticator()).toBe(true)
    })

    test('false when supported and not platform authenticator', async () => {
        mocks.browserSupportsWebAuthn = true
        mocks.platformAuthenticatorIsAvailable = false

        expect(await isPlatformAuthenticator()).toBe(false)
        expect(await isNotPlatformAuthenticator()).toBe(true)
    })
});
