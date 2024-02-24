/**
 * Check if the browser supports WebAuthn
 *
 * @return {boolean}
 */
export async function isSupported(): Promise<boolean> {
    const callback = window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable
        ?? (async () => false)

    return await callback()
}

/**
 * Check if the browser doesn't support WebAuthn
 */
export async function isNotSupported(): Promise<boolean> {
    return ! await isSupported()
}

/**
 * Check if the browser doesn't support WebAuthn
 */
export async function isUnsupported(): Promise<boolean> {
    return ! await isSupported()
}

/**
 * Check if the browser can immediately authenticate without picking credentials.
 */
export async function isAutomatic(): Promise<boolean> {
    return await isSupported()
        && await (window.PublicKeyCredential.isConditionalMediationAvailable ?? (async () => false))()
}

/**
 * Check if the browser cannot immediately authenticate without picking credentials.
 */
export async function isNotAutomatic(): Promise<boolean> {
    return ! await isAutomatic()
}

/**
 * Check if the browser cannot immediately authenticate without picking credentials.
 */
export async function isManual(): Promise<boolean> {
    return ! await isAutomatic()
}
