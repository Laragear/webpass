/**
 * Tries to find the CSRF token in cookies.
 */
export function findTokenInCookie(): string | undefined {
    // Find a match for the CSRF-TOKEN or XSRF-TOKEN cookie, case-insensitive,
    // as 3 groups: the whitespace preceding, the cooke name, and the value.
    // If there is a match, decode the last group that contains the value.
    const match: RegExpMatchArray|null = document.cookie.match(
        new RegExp('(^|;\\s*)([CX]SRF-TOKEN)=([^;]*)', 'i')
    );

    return match ? decodeURIComponent(match[3]) : undefined;
}

/**
 * Find the CSRF token from a meta tag in the header.
 */
export function findTokenInMeta(): string | undefined {
    return Array
        .from(document.head.getElementsByTagName("meta"))
        .find((element: HTMLMetaElement): boolean => element.name.toLowerCase() === "csrf-token" && !!element.content)
        ?.content
}

/**
 * Find the CSRF token from a meta input
 */
export function findTokenInInput(): string | undefined {
    // Then, try to find a hidden input containing the CSRF token.
    return Array
        .from(document.body.getElementsByTagName("input"))
        .find((input: HTMLInputElement): boolean => {
            return input.name.toLowerCase() === "_token"
                && input.type.toLowerCase() === "hidden"
                && !!input.value
        })
        ?.value
}

/**
 * Get the type of the token retrieved.
 */
export function isCsrfToken(token: string): boolean {
    if (token.length < 40) {
        const error = new Error("The token must be an CSRF (40 characters) or XSRF token.")

        error.name = 'InvalidToken'

        throw error
    }

    return token.length === 40
}
