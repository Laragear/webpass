import type {CeremonyOptions, CeremonyOptionsWithoutPath } from "./types"
import {ofetch} from "ofetch"
import {mergeDeep, pull} from "./utils"
import {findTokenInCookie, findTokenInInput, findTokenInMeta, isCsrfToken} from "./csrf";

/**
 * Check if the headers don't have a CSRF or XSRF token.
 */
function missingToken(headers: Record<string, string>): boolean {
    return ! Object.keys(headers)
        .find((key: string): boolean => {
            return ['x-csrf-token', 'x-xsrf-token'].includes(key.toLowerCase())
                && !!headers[key]
        })
}

/**
 * Pull the token configuration key out of the options
 */
function pullTokenConfig(options: CeremonyOptionsWithoutPath): boolean|string {
    return pull(options, "findCsrfToken") || pull(options, "findXsrfToken") as boolean|string
}

/**
 * Set the token in the headers if needed.
 */
function setToken(token: string|boolean, headers: Record<string, string>): void {
    // Find the token if the token is set to "true"
    if (token === true && missingToken(headers)) {
        token = findTokenInMeta() ?? findTokenInInput() ?? findTokenInCookie() ?? ''
    }

    // If the token is a string, add it verbatim to the header.
    if (typeof token === "string") {
        headers[isCsrfToken(token) ? 'X-CSRF-TOKEN' : 'X-XSRF-TOKEN'] = token
    }
}

export default async <T>(options: CeremonyOptions, webAuthnData: Object = {}): Promise<T> => {
    const {path, ...fetchOptions} = options

    fetchOptions.headers = fetchOptions.headers || {}

    setToken(pullTokenConfig(options), fetchOptions.headers)

    // @ts-ignore
    fetchOptions.body = mergeDeep(fetchOptions.body ?? {}, webAuthnData)

    return await ofetch<T>(path, fetchOptions)
}
