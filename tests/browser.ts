import {beforeEach, describe, expect, test, vi} from "vitest"
import {isAutomatic, isManual, isNotAutomatic, isNotSupported, isSupported, isUnsupported} from "../src/browser"

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('Browser Support tests', () => {

    test('true if has PublicKeyCredential and UserVerification', async () => {
        vi.stubGlobal('PublicKeyCredential', {
            isUserVerifyingPlatformAuthenticatorAvailable: async () => true
        })

        expect(await isSupported()).toBe(true)
        expect(await isNotSupported()).toBe(false)
        expect(await isUnsupported()).toBe(false)
    })

    test('false if has PublicKeyCredential and not UserVerification', async () => {
        vi.stubGlobal('PublicKeyCredential', {
            isUserVerifyingPlatformAuthenticatorAvailable: async () => false
        })

        expect(await isSupported()).toBe(false)
        expect(await isNotSupported()).toBe(true)
        expect(await isUnsupported()).toBe(true)
    })

    test('false if has no PublicKeyCredential', async () => {
        vi.stubGlobal('PublicKeyCredential', undefined)

        expect(await isSupported()).toBe(false)
        expect(await isNotSupported()).toBe(true)
        expect(await isUnsupported()).toBe(true)
    })
})

describe('Browser fast login tests', () => {
    test('true when Supported and ConditionalMediation', async () => {
        vi.stubGlobal('PublicKeyCredential', {
            isUserVerifyingPlatformAuthenticatorAvailable: async () => true,
            isConditionalMediationAvailable: async () => true
        })

        expect(await isAutomatic()).toBe(true)
        expect(await isNotAutomatic()).toBe(false)
        expect(await isManual()).toBe(false)
    })

    test('false when Supported and not ConditionalMediation', async () => {
        vi.stubGlobal('PublicKeyCredential', {
            isUserVerifyingPlatformAuthenticatorAvailable: async () => true,
            isConditionalMediationAvailable: async () => false
        })

        expect(await isAutomatic()).toBe(false)
        expect(await isNotAutomatic()).toBe(true)
        expect(await isManual()).toBe(true)
    })

    test('false when Supported and ConditionalMediation unavailable', async () => {
        vi.stubGlobal('PublicKeyCredential', {
            isUserVerifyingPlatformAuthenticatorAvailable: async () => true,
        })

        expect(await isAutomatic()).toBe(false)
        expect(await isNotAutomatic()).toBe(true)
        expect(await isManual()).toBe(true)
    })

    test('false when partially Supported', async () => {
        vi.stubGlobal('PublicKeyCredential', {
            isUserVerifyingPlatformAuthenticatorAvailable: async () => false,
        })

        expect(await isAutomatic()).toBe(false)
        expect(await isNotAutomatic()).toBe(true)
        expect(await isManual()).toBe(true)
    })

    test('false when not Supported', async () => {
        vi.stubGlobal('PublicKeyCredential', undefined)

        expect(await isAutomatic()).toBe(false)
        expect(await isNotAutomatic()).toBe(true)
        expect(await isManual()).toBe(true)
    })
});
