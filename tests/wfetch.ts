import {afterEach, beforeEach, describe, expect, test, vi} from "vitest"
import wfetch from "../src/wfetch"

vi.mock('ofetch', () => {
    return {
        ofetch: (path: string, options: object) => {
            return {path, options}
        }
    }
})

beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
})

afterEach(() => {
    vi.clearAllMocks()
})

const token = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn'

describe('Fetch test', () => {
    test('fetch without token by default', async() => {
        expect(await wfetch({
            path: 'foo-bar',
        }, {
            foo: {quz: 'qux'}
        })).toHaveProperty('options.body', {foo: {quz: 'qux'}})
    })

    test('fetch with token found in header', async () => {
        expect(await wfetch({
            path: 'foo-bar',
            headers: {
                'X-csrf-token': 'invalid-token'
            },
            findCsrfToken: true,
        }, {
            foo: {quz: 'qux'}
        })).toHaveProperty('options.headers.X-csrf-token', 'invalid-token')

        expect(await wfetch({
            path: 'foo-bar',
            headers: {
                'X-xsrf-token': 'invalid-token'
            },
            findCsrfToken: true,
        }, {
            foo: {quz: 'qux'}
        })).toHaveProperty('options.headers.X-xsrf-token', 'invalid-token')
    })

    test('fetch with csrf token found in header but empty throws error', async () => {
        expect(async () => {
            await wfetch({path: 'foo', headers: {'X-csrf-token': ''}, findCsrfToken: true,}, {foo: 'bar'})
        })
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')

        expect(async () => {
            await wfetch({path: 'foo', headers: {'X-xsrf-token': ''}, findCsrfToken: true,}, {foo: 'bar'})
        })
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')
    })

    test('fetch with csrf token found in meta', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => [{name: "csrf-token", content: token}]},
            body: {getElementsByTagName: () => []},
            cookie: ''
        })

        expect(await wfetch({path: 'foo-bar', findCsrfToken: true,}, {foo: 'bar'}))
            .toHaveProperty('options.headers.X-CSRF-TOKEN', token)

        expect(await wfetch({path: 'foo-bar', findXsrfToken: true,}, {foo: 'bar'}))
            .toHaveProperty('options.headers.X-CSRF-TOKEN', token)
    })

    test('fetch with empty csrf token found in meta throws error', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => [{name: "csrf-token", content: ''}]},
            body: {getElementsByTagName: () => []},
            cookie: ''
        })

        expect(async () => await wfetch({path: 'foo-bar', findCsrfToken: true,}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')

        expect(async () => await wfetch({path: 'foo-bar', findXsrfToken: true,}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')
    })

    test('fetch with csrf token found in input', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => []},
            body: {getElementsByTagName: () => [{name: "_token", type: "hidden", value: token}]},
            cookie: ''
        })

        expect(await wfetch({path: 'foo-bar', findCsrfToken: true,}, {foo: 'bar'}))
            .toHaveProperty('options.headers.X-CSRF-TOKEN', token)

        expect(await wfetch({path: 'foo-bar', findXsrfToken: true,}, {foo: 'bar'}))
            .toHaveProperty('options.headers.X-CSRF-TOKEN', token)
    })

    test('fetch with empty csrf token found in input throws error', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => []},
            body: {getElementsByTagName: () => [{name: "_token", type: "hidden", value: ''}]},
            cookie: ''
        })

        expect(async () => await wfetch({path: 'foo-bar', findCsrfToken: true,}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')

        expect(async () => await wfetch({path: 'foo-bar', findXsrfToken: true,}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')
    })

    test('fetch with xsrf token found in cookie', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => []},
            body: {getElementsByTagName: () => []},
            cookie: `__utma=126154768.asdasd.2; XSRF-TOKEN=${token + 1}; OTHER=ASasdasd`
        })

        expect(await wfetch({path: 'foo-bar', findCsrfToken: true,}, {foo: 'bar'}))
            .toHaveProperty('options.headers.X-XSRF-TOKEN', token + 1)

        expect(await wfetch({path: 'foo-bar', findXsrfToken: true,}, {foo: 'bar'}))
            .toHaveProperty('options.headers.X-XSRF-TOKEN', token + 1)
    })

    test('fetch with empty xsrf token found in cookie throws error', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => []},
            body: {getElementsByTagName: () => []},
            cookie: `__utma=126154768.asdasd.2; XSRF-TOKEN=; OTHER=ASasdasd`
        })

        expect(async () => await wfetch({path: 'foo-bar', findCsrfToken: true,}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')

        expect(async () => await wfetch({path: 'foo-bar', findXsrfToken: true,}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')
    })

    test('fetch without finding token', async () => {
        const result = await wfetch({path: 'foo-bar'}, {foo: 'bar'})

        expect(result).not.toHaveProperty('options.headers.X-CSRF-TOKEN')
        expect(result).not.toHaveProperty('options.headers.X-XSRF-TOKEN')
    })

    test('fetch with no token found throws error', async () => {
        vi.stubGlobal('document', {
            head: {getElementsByTagName: () => []},
            body: {getElementsByTagName: () => []},
            cookie: ''
        })

        expect(async () => await wfetch({path: 'foo-bar', findXsrfToken: true}, {foo: 'bar'}))
            .rejects
            .toThrowError('The token must be an CSRF (40 characters) or XSRF token.')
    })

    test('fetch without body', async () => {
        const result = await wfetch({
            path: 'foo-bar',
        }, {
            foo: {quz: 'qux'}
        })

        expect(result).toEqual({
            path: 'foo-bar',
            options: {
                body: {foo: {quz: 'qux'}},
                headers: {}
            }
        })
    })

    test('fetch with body merged', async () => {
        const result = await wfetch({
            path: 'foo-bar',
            body: {foo: {bar: 'baz'}}
        }, {
            foo: {quz: 'qux'}
        })

        expect(result).toEqual({
            path: 'foo-bar',
            options: {
                body: {foo: {bar: 'baz', quz: 'qux'}},
                headers: {}
            }
        })
    })
})
