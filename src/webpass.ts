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
import {
    isSupported,
    isNotSupported,
    isUnsupported,
    isAutofillable,
    isNotAutofillable,
    isPlatformAuthenticator,
    isNotPlatformAuthenticator
} from "./browser"
import {isObjectEmpty, mergeDeep, normalizeOptions} from "./utils"
import defaultConfig from "./config"
import wfetch from "./wfetch"
import benchmark from "./benchmark"
import {startAuthentication, startRegistration} from "@simplewebauthn/browser";
import type {AuthenticationResponseJSON, RegistrationResponseJSON} from "@simplewebauthn/types";

/**
 * Create a new Error with a name and message.
 */
function newError(name: string, message: string, cause: unknown = undefined): Error {
    const error = new Error(message)

    error.name = name
    error.cause = cause

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
        const bench = benchmark()

        // Normalize the arguments
        const normalizedOptions = normalizeOptions(options, currentConfig, "attestOptions")
        const normalizedResponseOptions = normalizeOptions(response, currentConfig, "attest")

        // Retrieve the attestation options from the server
        const attestationOptions: ServerPublicKeyCredentialCreationOptions | undefined = await wfetch<ServerPublicKeyCredentialCreationOptions | undefined>(normalizedOptions)

        console.debug("Attestation Options Received", attestationOptions)

        // If the response is empty, bail out
        if (!attestationOptions || isObjectEmpty(attestationOptions)) {
            throw newError("InvalidAttestationResponse", "The server responded with invalid or empty credential creation options.")
        }

        let credentials: RegistrationResponseJSON

        try {
            credentials = await startRegistration(attestationOptions)
        } catch (cause) {
            throw newError("AttestationCancelled", "The credentials creation was not completed.", cause)
        }

        console.debug("Attestation Credentials Created", credentials);

        const result = await wfetch<Record<string, any>>(normalizedResponseOptions, credentials)

        console.debug("Attestation benchmark", bench.stop())

        return result
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
        const bench = benchmark()

        // Normalize the arguments
        const normalizedOptions = normalizeOptions(options, currentConfig, "assertOptions")
        const normalizedResponseOptions = normalizeOptions(response, currentConfig, "assert")

        // Get the assertion challenge from the server
        const assertionOptions: ServerPublicKeyCredentialRequestOptions | undefined = await wfetch<ServerPublicKeyCredentialRequestOptions | undefined>(normalizedOptions)

        console.debug("Assertion Options Received", assertionOptions)

        // If we didn't receive anything, return it as an invalid server message.
        if (!assertionOptions || isObjectEmpty(assertionOptions)) {
            throw newError("InvalidAssertionResponse", "The server responded with invalid or empty credential request options.")
        }

        let credentials: AuthenticationResponseJSON

        try {
            credentials = await startAuthentication(
                assertionOptions,
                normalizedOptions.useAutofill ?? normalizedResponseOptions.useAutofill ?? currentConfig.useAutofill
            )
        } catch (cause) {
            throw newError("AssertionCancelled", "The credentials request was not completed.", cause)
        }

        console.debug("Assertion Credentials Retrieved", credentials)

        // Expect an authentication response from the server with the user, credentials, or anything.
        const result = await wfetch<Record<string, string>>(normalizedResponseOptions, credentials)

        console.debug("Assertion benchmark", bench.stop())

        return result
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
    isAutofillable,
    isNotAutofillable,
    isPlatformAuthenticator,
    isNotPlatformAuthenticator
} as WebpassStatic
