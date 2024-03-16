import {
    browserSupportsWebAuthn,
    browserSupportsWebAuthnAutofill,
    platformAuthenticatorIsAvailable
} from "@simplewebauthn/browser";

/**
 * Check if the browser supports WebAuthn
 *
 * @return {boolean}
 */
export function isSupported(): boolean {
    return browserSupportsWebAuthn()
}

/**
 * Check if the browser doesn't support WebAuthn
 */
export function isNotSupported(): boolean {
    return ! isSupported()
}

/**
 * Check if the browser doesn't support WebAuthn
 */
export function isUnsupported(): boolean {
    return ! isSupported()
}

/**
 * Check if the browser can show an autofill dialog with existing Passkeys.
 *
 * @see https://web.dev/articles/passkey-form-autofill
 */
export async function isAutofillable(): Promise<boolean> {
    return isSupported() && await browserSupportsWebAuthnAutofill()
}

/**
 * Check if the browser cannot show an autofill dialog with existing Passkeys.
 *
 * @see https://web.dev/articles/passkey-form-autofill
 */
export async function isNotAutofillable(): Promise<boolean> {
    return ! await isAutofillable()
}

/**
 * Check if the browser is on device compatible with Touch ID, Face ID, Windows Hello, or others.
 */
export async function isPlatformAuthenticator(): Promise<boolean> {
    return isSupported() && await platformAuthenticatorIsAvailable()
}

/**
 * Check if the browser is not on device compatible with Touch ID, Face ID, Windows Hello, or others.
 */
export async function isNotPlatformAuthenticator(): Promise<boolean> {
    return ! await isPlatformAuthenticator()
}
