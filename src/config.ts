import type {Config} from "./types"

/**
 * Default configuration.
 *
 * @type {Config}
 */
export default {
    method: "post",
    redirect: "error",
    baseURL: undefined,
    findCsrfToken: false,
    findXsrfToken: false,
    useAutofill: undefined,
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
