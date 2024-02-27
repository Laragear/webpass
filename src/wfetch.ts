import {CeremonyOptions, CeremonyOptionsWithoutPath, type Webpass} from "./types.ts"
import {ofetch} from "ofetch"
import {mergeDeep, pull} from "./utils.ts"
import {findTokenInCookie, findTokenInInput, findTokenInMeta, isCsrfToken} from "./csrf.ts";

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
 * Check if the token should be found.
 */
function shouldFindToken(options: CeremonyOptionsWithoutPath): boolean {
    const findCsrf = pull(options, "findCsrfToken")
    const findXsrf = pull(options, "findXsrfToken")

    return Boolean(findCsrf || findXsrf)
}

export default async <T>(options: CeremonyOptions, webAuthnData: Object = {}): Promise<T> => {
    const {path, ...fetchOptions} = options

    fetchOptions.headers = fetchOptions.headers || {}

    if (shouldFindToken(fetchOptions) && missingToken(fetchOptions.headers)) {
        // Find the token in the document meta tags, inputs or cookies.
        const token = findTokenInMeta() ?? findTokenInInput() ?? findTokenInCookie() ?? ''

        fetchOptions.headers[isCsrfToken(token) ? 'X-CSRF-TOKEN' : 'X-XSRF-TOKEN'] = token
    }

    // @ts-ignore
    fetchOptions.body = mergeDeep(fetchOptions.body ?? {}, webAuthnData)

    return await ofetch<T>(path, fetchOptions)
}
