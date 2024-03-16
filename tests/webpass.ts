import {afterAll, afterEach, beforeEach, describe, expect, test, vi} from "vitest"
import Webpass from "../src/webpass"
import wfetch from "../src/wfetch"

const attestOptions = {
    rp: {
        name: "webauthn.com",
        id: "webauthn.com"
    },
    user: {
        id: "c2Rhc2Rhc2E",
        name: "sample_user",
        displayName: "sample_user"
    },
    challenge: "Z9nQZb7UZdtG_iAOQGDZVqStwLcCtkc4wkVAqxRmXi6qWqqGNPFHv31X4aj-W-gN2T21Wck8hC18fgL9_3a8rw",
    pubKeyCredParams: [
        {type: "public-key", alg: -7},
        {type: "public-key", alg: -257}
    ],
    timeout: 60000,
    excludeCredentials: [
        {
            id: "OMR2xF8KLNYj40-5k_O-_m6vSur2FGJL1gkg_315NGU",
            type: "public-key",
            transports: ["usb"]
        }
    ],
    authenticatorSelection: {
        residentKey: "preferred",
        requireResidentKey: false,
        userVerification: "preferred"
    },
    attestation: "none",
    hints: [],
    extensions: {
        credProps: true
    }
}

const attestResponse = {
    id: "JVR8r3vleicZCmDhNUkWW9F3pJMIXJESuo9nb_X-6rI",
    rawId: new TextEncoder().encode("JVR8r3vleicZCmDhNUkWW9F3pJMIXJESuo9nb_X-6rI"),
    response: {
        attestationObject: new TextEncoder().encode("o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVikdKbqkhPJnC90siSSsyDPQCYqlMGpUKA5fyklC2CEHvBFAAAAAQAAAAAAAAAAAAAAAAAAAAAAICVUfK975XonGQpg4TVJFlvRd6STCFyRErqPZ2_1_uqypQECAyYgASFYIIl2tHjMgLgCui-6vhsf7iQSpbTsLzkwCy547yOJPqDVIlggQMRGVVsLtGumRqGmWHhtziEvYLEexJ8GiAyRQ5OlmtM"),
        clientDataJSON: new TextEncoder().encode("eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWjluUVpiN1VaZHRHX2lBT1FHRFpWcVN0d0xjQ3RrYzR3a1ZBcXhSbVhpNnFXcXFHTlBGSHYzMVg0YWotVy1nTjJUMjFXY2s4aEMxOGZnTDlfM2E4cnciLCJvcmlnaW4iOiJodHRwczovL3dlYmF1dGhuLmlvIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ"),
        transports: ["usb"],
        publicKeyAlgorithm: -7,
        publicKey: new TextEncoder().encode("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEiXa0eMyAuAK6L7q-Gx_uJBKltOwvOTALLnjvI4k-oNVAxEZVWwu0a6ZGoaZYeG3OIS9gsR7EnwaIDJFDk6Wa0w"),
        authenticatorData: new TextEncoder().encode("dKbqkhPJnC90siSSsyDPQCYqlMGpUKA5fyklC2CEHvBFAAAAAQAAAAAAAAAAAAAAAAAAAAAAICVUfK975XonGQpg4TVJFlvRd6STCFyRErqPZ2_1_uqypQECAyYgASFYIIl2tHjMgLgCui-6vhsf7iQSpbTsLzkwCy547yOJPqDVIlggQMRGVVsLtGumRqGmWHhtziEvYLEexJ8GiAyRQ5OlmtM"),
    },
    type: "public-key",
    clientExtensionResults: {
        credProps: {
            rk: true
        }
    },
    authenticatorAttachment: "cross-platform"
}

const assertOptions = {
    challenge: "2CsMvjganOUnbMyt3XIHS0k-X2HdeCmM6u60weOxJaLOBNmn7BwA47LAqX6ETWO0Xw-VfX72XOFXczkvTipXeg",
    timeout: 60000,
    rpId: "webauthn.com",
    allowCredentials: [
        {
            id: "OMR2xF8KLNYj40-5k_O-_m6vSur2FGJL1gkg_315NGU",
            type: "public-key",
            transports: ["usb"]
        }
    ],
    userVerification: "preferred"
}

const assertResponse = {
    id: "OMR2xF8KLNYj40-5k_O-_m6vSur2FGJL1gkg_315NGU",
    rawId: new TextEncoder().encode("OMR2xF8KLNYj40-5k_O-_m6vSur2FGJL1gkg_315NGU"),
    response: {
        authenticatorData: new TextEncoder().encode("dKbqkhPJnC90siSSsyDPQCYqlMGpUKA5fyklC2CEHvAFAAAAAg"),
        clientDataJSON: new TextEncoder().encode("eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiMkNzTXZqZ2FuT1VuYk15dDNYSUhTMGstWDJIZGVDbU02dTYwd2VPeEphTE9CTm1uN0J3QTQ3TEFxWDZFVFdPMFh3LVZmWDcyWE9GWGN6a3ZUaXBYZWciLCJvcmlnaW4iOiJodHRwczovL3dlYmF1dGhuLmlvIiwiY3Jvc3NPcmlnaW4iOmZhbHNlLCJvdGhlcl9rZXlzX2Nhbl9iZV9hZGRlZF9oZXJlIjoiZG8gbm90IGNvbXBhcmUgY2xpZW50RGF0YUpTT04gYWdhaW5zdCBhIHRlbXBsYXRlLiBTZWUgaHR0cHM6Ly9nb28uZ2wveWFiUGV4In0"),
        signature: new TextEncoder().encode("MEQCIDbDa-IDQlvcO81rBxXc3l_qcRzoe_IfDXV4h6eUDzBTAiB9I4C_mTJ6xiKW36MDbbkg6lT2iUVZCxGSHprNiGxYHg"),
        userHandle: new TextEncoder().encode("YXNkYXNkQGFzZC5jb20"),
    },
    type: "public-key",
    clientExtensionResults: {},
    authenticatorAttachment: "cross-platform"
}

beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
})

afterEach(() => {
    vi.clearAllMocks()
})

vi.mock('../src/wfetch')

const mock = {
    startRegistration: () => attestResponse,
    startAuthentication: () => assertResponse,
}

vi.mock('@simplewebauthn/browser', () => {
    return {
        startRegistration: async () => mock.startRegistration(),
        startAuthentication: async () => mock.startAuthentication(),
    }
})

describe("Webpass test", () => {

    const consoleMock = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

    afterAll(() => {
        consoleMock.mockReset()
    })

    test('creates instance', () => {
        const webpass = Webpass.create()

        expect(webpass).toHaveProperty('attest')
        expect(webpass).toHaveProperty('assert')
        expect(webpass).toHaveProperty('attestRaw')
        expect(webpass).toHaveProperty('assertRaw')
    })

    test('attests raw', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/attest-options' ? attestOptions : {id: 'test-id'}
        })

        mock.startRegistration = () => attestResponse

        const result = await Webpass.attestRaw()

        expect(result).toEqual({id: 'test-id'})
    });

    test('attests raw throws if empty attestation options', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => { })

        await expect(Webpass.attestRaw)
            .rejects
            .toThrowError(/^The server responded with invalid or empty credential creation options.$/)
    })

    test('attests raw throws if ceremony throws', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => attestOptions)

        mock.startRegistration = () => {
            throw new Error('Test')
        }

        await expect(Webpass.attestRaw)
            .rejects
            .toThrowError(/^The credentials creation was not completed.$/)
    })

    test('attests', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/attest-options' ? attestOptions : {id: 'test-id'}
        })

        mock.startRegistration = () => attestResponse

        const result = await Webpass.attest()

        expect(result).toEqual({
            credentials: {id: 'test-id'},
            data: {id: 'test-id'},
            error: undefined,
            id: 'test-id',
            success: true
        })
    })

    test('attest detects user uuid', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/attest-options' ? attestOptions : {uuid: 'test-uuid'}
        })

        mock.startRegistration = () => attestResponse

        const result = await Webpass.attest()

        expect(result).toEqual({
            credentials: {uuid: 'test-uuid'},
            data: {uuid: 'test-uuid'},
            error: undefined,
            id: 'test-uuid',
            success: true
        })
    })

    test('attest error if empty attestation options', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => {})

        const result = await Webpass.attest()

        const error = new Error('The server responded with invalid or empty credential creation options.')
        error.name = 'InvalidAttestationResponse'

        expect(result).toEqual({
            credentials: undefined,
            data: undefined,
            error: error,
            id: undefined,
            success: false
        })
    })

    test('attest error if ceremony throws', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => attestOptions)

        mock.startRegistration = () => {
            throw new Error('test')
        }

        const result = await Webpass.attest()

        const error = new Error('The credentials creation was not completed.')
        error.name = 'AttestationCancelled'

        expect(result).toEqual({
            credentials: undefined,
            data: undefined,
            error: error,
            id: undefined,
            success: false
        })
    })

    test('asserts raw', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : {success: true}
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assertRaw()

        expect(result).toEqual({success: true})
    })

    test('assert raw throws if empty assertion options', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => {})

        await expect(Webpass.assertRaw)
            .rejects
            .toThrowError(/^The server responded with invalid or empty credential request options.$/)
    })

    test('assert raw throws if ceremony throws', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => assertOptions)

        mock.startAuthentication = () => {
            throw new Error('test')
        }

        await expect(Webpass.assertRaw)
            .rejects
            .toThrowError(/^The credentials request was not completed.$/)
    })

    test('asserts', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : {success: true}
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assert()

        expect(result).toEqual({
            user: {success: true},
            data: {success: true},
            error: undefined,
            token: undefined,
            success: true
        })
    })

    test('asserts detects user key with token', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : {user: {name: 'john', token: 'test'}}
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assert()

        expect(result).toEqual({
            user: {name: 'john', token: 'test'},
            data: {user: {name: 'john', token: 'test'}},
            error: undefined,
            token: 'test',
            success: true
        })
    })

    test('asserts detects data key with token', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : {token: 'test'}
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assert()

        expect(result).toEqual({
            user: {token: 'test'},
            data: {token: 'test'},
            error: undefined,
            token: 'test',
            success: true
        })
    })

    test('asserts detects user key with jwt', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : {user: {name: 'john', jwt: 'test'}}
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assert()

        expect(result).toEqual({
            user: {name: 'john', jwt: 'test'},
            data: {user: {name: 'john', jwt: 'test'}},
            error: undefined,
            token: 'test',
            success: true
        })
    })

    test('asserts detects data key with jwt', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : {jwt: 'test'}
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assert()

        expect(result).toEqual({
            user: {jwt: 'test'},
            data: {jwt: 'test'},
            error: undefined,
            token: 'test',
            success: true
        })
    })

    test('asserts detects string as token', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation((options: { path: string }) => {
            return options.path === '/auth/assert-options' ? assertOptions : 'token'
        })

        mock.startAuthentication = () => assertResponse

        const result = await Webpass.assert()

        expect(result).toEqual({
            user: undefined,
            data: 'token',
            error: undefined,
            token: 'token',
            success: true
        })
    })

    test('asserts error if empty assertion options', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => {})

        const result = await Webpass.assert()

        const error = new Error('The server responded with invalid or empty credential request options.')
        error.name = 'InvalidAssertionResponse'

        expect(result).toEqual({
            user: undefined,
            data: undefined,
            error: error,
            token: undefined,
            success: false
        })
    })

    test('asserts error if ceremony throws', async () => {
        // @ts-ignore
        vi.mocked(wfetch).mockImplementation(() => assertOptions)

        mock.startAuthentication = () => {
            throw new Error('test')
        }

        const result = await Webpass.assert()

        const error = new Error('The credentials request was not completed.')
        error.name = 'AssertionCancelled'

        expect(result).toEqual({
            user: undefined,
            data: undefined,
            error: error,
            token: undefined,
            success: false
        })
    })
})
