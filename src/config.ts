import type {Config} from "./types.ts"

/**
 * Default configuration.
 *
 * @type {Config}
 */
export default {
    method: "post",
    redirect: "error",
    baseURL: undefined,
    findCsrfToken: true,
    findXsrfToken: true,
    routes: {
        attestOptions: "/auth/attest-options",
        attest: "/auth/attest",
        assertOptions: "/auth/assert-options",
        assert: "/auth/assert",
    },
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "same-origin",
} as Config
