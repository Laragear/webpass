import type {
    AssertionResult,
    AttestationResult,
    CeremonyOptionsWithoutPath,
    CeremonyResultRaw,
    Config,
    ServerPublicKeyCredentialCreationOptions,
    ServerPublicKeyCredentialRequestOptions,
    Webpass,
    WebpassStatic
} from "./types"
import {isAutomatic, isManual, isNotAutomatic, isNotSupported, isSupported, isUnsupported} from "./browser"
import {isArrayBuffer, isObjectEmpty, mergeDeep, normalizeOptions} from "./utils"
import defaultConfig from "./config"
import wfetch from "./wfetch"

/**
 * Parse the incoming credential creation options from the server, which is partially BASE64 URL encoded.
 */
function parseServerCreationOptions(publicKey: ServerPublicKeyCredentialCreationOptions): PublicKeyCredentialCreationOptions {
    return {
        ...publicKey,
        challenge: base64UrlToUint8Array(publicKey.challenge),
        user: {...publicKey.user, id: base64UrlToUint8Array(publicKey.user.id)},
        excludeCredentials: publicKey.excludeCredentials.map(data => ({...data, id: base64UrlToUint8Array(data.id)}))
    }
}

/**
 * Parse the incoming credential request options from the server, which is partially BASE64 URL encoded.
 */
function parseServerRequestOptions(publicKey: ServerPublicKeyCredentialRequestOptions): PublicKeyCredentialRequestOptions {
    return {
        ...publicKey,
        challenge: base64UrlToUint8Array(publicKey.challenge),
        allowCredentials: publicKey.allowCredentials.map(data => ({...data, id: base64UrlToUint8Array(data.id)}))
    }
}

/**
 * Parses the outgoing credentials from the browser to the server.
 */
function parseOutgoingCredentials(credentials: PublicKeyCredential | Credential): Record<string, any> {
    // Copy all the credentials properties into a new object.
    const response: Record<string, any> = Object.assign({}, credentials)

    // Maintain future compatibility for WebAuthn 3.0 if some credential properties are already strings
    if ("rawId" in credentials) {
        response.rawId = isArrayBuffer(credentials.rawId)
            ? arrayToBase64UrlString(credentials.rawId)
            : credentials.rawId
    }

    if ("response" in credentials) {
        // Forcefully transform all ArrayBuffers in the credentials response as BASE64 strings.
        response.response = Object.fromEntries(
            Object.entries(credentials.response).map(([index, value]): [string, string] => {
                return [index, isArrayBuffer(value) ? arrayToBase64UrlString(value) : value]
            })
        )
    }

    return response;
}

/**
 * Transform a string into Uint8Array instance.
 */
function base64UrlToUint8Array(input: string): Uint8Array {
    // Pad the input and replace the safe characters to unsafe characters
    input = (input + "=".repeat((4 - input.length % 4) % 4))
        .replace(/-/g, "+")
        .replace(/_/g, "/")

    return new TextEncoder().encode(input)
}

/**
 * Encodes an array of bytes to a BASE64 URL string
 */
function arrayToBase64UrlString(arrayBuffer: ArrayBuffer): string {
    return btoa(new TextDecoder().decode(arrayBuffer))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
}

/**
 * Create a new Error with a name and message.
 */
function newError(name: string, message: string): Error {
    const error = new Error(message)

    error.name = name

    return error
}

/**
 * Create a new Webpass instance.
 */
function webpass(config: Partial<Config> = {}): Webpass {
    // Merge the configuration
    const currentConfig: Config = mergeDeep(structuredClone(defaultConfig), config)

    /**
     * Registers the device public key in the server and wraps the results in an object.
     */
    async function attest(options?: CeremonyOptionsWithoutPath | string, response?: CeremonyOptionsWithoutPath | string): Promise<AttestationResult> {
        // Create the result we will return to the user on any scenario.
        const result: AttestationResult = {
            data: undefined,
            credentials: undefined,
            id: undefined,
            success: false,
            error: undefined
        }

        // Retrieve the attestation options from the server
        try {
            result.data = result.credentials = await attestRaw(options, response)
        } catch (error) {
            return {...result, error}
        } finally {
            result.success = result.error === undefined
        }

        // Here we will just short-circuit the ID from the response as convenience, if it exists.
        if (typeof result.data === "object") {
            result.id = result.data?.id || result.data?.uuid
        }

        return result
    }

    /**
     * Registers the device public key in the server.
     */
    async function attestRaw(options?: CeremonyOptionsWithoutPath | string, response?: CeremonyOptionsWithoutPath | string): Promise<CeremonyResultRaw> {
        // Normalize the arguments
        const normalizedOptions = normalizeOptions(options, currentConfig, "attestOptions")
        const normalizedResponseOptions = normalizeOptions(response, currentConfig, "attest")

        // Retrieve the attestation options from the server
        const attestationOptions: ServerPublicKeyCredentialCreationOptions | undefined = await wfetch<ServerPublicKeyCredentialCreationOptions | undefined>(normalizedOptions)

        // If the response is empty, bail out
        if (!attestationOptions || isObjectEmpty(attestationOptions)) {
            throw newError("InvalidAttestationResponse", "The server responded with invalid or empty credential creation options.")
        }

        const credentials: Credential | null = await navigator.credentials.create({
            publicKey: parseServerCreationOptions(attestationOptions)
        })

        // If the user denied the permission, throw an error.
        if (!credentials || isObjectEmpty(credentials)) {
            throw newError("AttestationCancelled", "The credentials creation was cancelled by the user or a timeout.")
        }

        return await wfetch<Record<string, any>>(normalizedResponseOptions, parseOutgoingCredentials(credentials))
    }

    /**
     * Assert a WebAuthn challenge, returns the user and token or null.
     */
    async function assert(options?: CeremonyOptionsWithoutPath | string, response?: CeremonyOptionsWithoutPath | string): Promise<AssertionResult> {
        // Create the result we will return to the user on any scenario.
        const result: AssertionResult = {
            data: undefined,
            user: undefined,
            token: undefined,
            success: false,
            error: undefined
        }

        // Get the assertion challenge from the server
        try {
            result.data = await assertRaw(options, response)
        } catch (error) {
            return {...result, error}
        } finally {
            result.success = result.error === undefined
        }

        // Try to set the user and token from the data received, or just the token if it's a string.
        if (typeof result.data === "object") {
            result.user = typeof result.data.user === "object" ? result.data.user : result.data
            result.token = result.data?.token || result.data?.jwt

            // If we couldn't get the token, try the user object if it is an object
            if (!result.token && typeof result.user === "object") {
                result.token = result.user?.token || result.user?.jwt
            }
        } else if (typeof result.data === "string") {
            result.token = result.data
        }

        return result
    }

    /**
     * Assert a WebAuthn challenge, returns the user and token or null.
     */
    async function assertRaw(options?: CeremonyOptionsWithoutPath | string, response?: CeremonyOptionsWithoutPath | string): Promise<CeremonyResultRaw> {
        // Normalize the arguments
        const normalizedOptions = normalizeOptions(options, currentConfig, "assertOptions")
        const normalizedResponseOptions = normalizeOptions(response, currentConfig, "assert")

        // Get the assertion challenge from the server
        const assertionOptions: ServerPublicKeyCredentialRequestOptions | undefined = await wfetch<ServerPublicKeyCredentialRequestOptions | undefined>(normalizedOptions)

        // If we didn't receive anything, return it as an invalid server message.
        if (!assertionOptions || isObjectEmpty(assertionOptions)) {
            throw newError("InvalidAssertionResponse", "The server responded with invalid or empty credential request options.")
        }

        // Let the browser sign the challenge with a credential, returning a response
        const credentials: Credential | null = await navigator.credentials.get({
            publicKey: parseServerRequestOptions(assertionOptions)
        })

        // If the user denied the permission, return null
        if (!credentials) {
            throw newError("AssertionCancelled", "The credentials request was cancelled by the user or timeout.")
        }

        // Expect an authentication response from the server with the user, credentials, or anything.
        return await wfetch<Record<string, string>>(normalizedResponseOptions, parseOutgoingCredentials(credentials))
    }

    return {
        assert,
        attest,
        assertRaw,
        attestRaw,
    }
}

export default {
    create: webpass,
    attest: async (options?, response?) => await (webpass()).attest(options, response),
    assert: async (options?, response?) => await (webpass()).assert(options, response),
    attestRaw: async (options?, response?) => await (webpass()).attestRaw(options, response),
    assertRaw: async (options?, response?) => await (webpass()).assertRaw(options, response),
    isSupported,
    isNotSupported,
    isUnsupported,
    isAutomatic,
    isNotAutomatic,
    isManual
} as WebpassStatic
