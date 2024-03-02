import {afterEach, beforeEach, describe, expect, test, vi} from "vitest"
import {findTokenInCookie, findTokenInInput, findTokenInMeta, isCsrfToken} from "../src/csrf"

beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
})

afterEach(() => {
    vi.clearAllMocks()
})

describe('Token in cookie', () => {
    test('finds xsrf token in cookies', () => {
        vi.stubGlobal('document', {cookie: '__utma=126154768.asdasd.2; XSRF-TOKEN=test_xsrf%3D; OTHER=ASasdasd'})

        expect(findTokenInCookie()).toBe('test_xsrf' + '=')
    })

    test('finds csrf token in cookies', () => {
        vi.stubGlobal('document', {cookie: '__utma=126154768.asdasd.2; CSRF-TOKEN=test_csrf%3D; OTHER=ASasdasd'})

        expect(findTokenInCookie()).toBe('test_csrf' + '=')
    })

    test('doesnt find token in cookies', () => {
        vi.stubGlobal('document', {cookie: '__utma=126154768.asdasd.2; TOKEN=ASasdasd'})

        expect(findTokenInCookie()).toBeUndefined()
    })

    test('doesnt find token in cookie empty', () => {
        vi.stubGlobal('document', {cookie: '__utma=126154768.asdasd.2; CSRF_TOKEN= ; XSRF_TOKEN= ;'})

        expect(findTokenInCookie()).toBeUndefined()
    })
})

describe('Token in meta', () => {

    const token = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn'

    test('finds csrf token in meta', () => {
        vi.stubGlobal('document', {
            head: {
                getElementsByTagName: () => [
                    {name: "xsrf-token", content: 'invalid'},
                    {name: "csrf-token", content: token},
                    {name: "token", content: 'invalid'}
                ]
            }
        })

        expect(findTokenInMeta()).toBe(token)
    })

    test('finds csrf token in meta in uppercase', () => {
        vi.stubGlobal('document', {
            head: {
                getElementsByTagName: () => [
                    {name: "CSRF-TOKEN", content: token}
                ]
            }
        })

        expect(findTokenInMeta()).toBe(token)
    })

    test('doesnt find csrf token empty', () => {
        vi.stubGlobal('document', {
            head: {
                getElementsByTagName: () => [
                    {name: "csrf-token", content: ''}
                ]
            }
        })

        expect(findTokenInMeta()).toBeUndefined()
    })

    test('doesnt find csrf token in any meta', () => {
        vi.stubGlobal('document', {
            head: {
                getElementsByTagName: () => [
                    {name: "xsrf-token", content: 'invalid'},
                    {name: "token", content: 'invalid'}
                ]
            }
        })

        expect(findTokenInMeta()).toBeUndefined()
    })
})

describe('Token in input', () => {
    const token = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn'

    test('finds csrf token in input', () => {
        vi.stubGlobal('document', {
            body: {
                getElementsByTagName: () => [
                    {name: "token", type: "hidden", value: 'invalid'},
                    {name: "_token", type: "hidden", value: token},
                    {name: "_token", type: "unhidden", value: 'invalid'},
                ]
            }
        })

        expect(findTokenInInput()).toBe(token)
    })

    test('finds csrf token in input uppercase', () => {
        vi.stubGlobal('document', {
            body: {
                getElementsByTagName: () => [
                    {name: "TOKEN", type: "HIDDEN", value: 'not-valid'},
                    {name: "_TOKEN", type: "HIDDEN", value: token},
                    {name: "_TOKEN", type: "UNHIDDEN", value: 'also-not-valid'},
                ]
            }
        })

        expect(findTokenInInput()).toBe(token)
    })

    test('doesnt find csrf token empty', () => {
        vi.stubGlobal('document', {
            body: {
                getElementsByTagName: () => [
                    {name: "_token", type: "hidden", value: ''},
                ]
            }
        })

        expect(findTokenInInput()).toBeUndefined()
    })

    test('doesnt find csrf token in any input', () => {
        vi.stubGlobal('document', {
            body: {
                getElementsByTagName: () => [
                    {name: "token", type: "hidden", value: 'invalid'},
                    {name: "_token", type: "unhidden", value: 'invalid'},
                ]
            }
        })

        expect(findTokenInInput()).toBeUndefined()
    })
})


describe('Token type', () => {
    test('token type is of csrf', () => {
        expect(isCsrfToken('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn')).toBe(true)
    })
    test('token type is of xsrf', () => {
        expect(isCsrfToken('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn+')).toBe(false)
    })

    test('token type throws if empty', async () => {
        await expect(async () => isCsrfToken(''))
            .rejects
            .toThrowError("The token must be an CSRF (40 characters) or XSRF token.")
    })

    test('token type throws if below 40 characters', async () => {
        await expect(async () => isCsrfToken('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm'))
            .rejects
            .toThrowError("The token must be an CSRF (40 characters) or XSRF token.")
    })
})
