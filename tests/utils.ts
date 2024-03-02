import {assert, describe, expect, test} from "vitest"
import {except, isArrayBuffer, isObjectEmpty, mergeDeep, normalizeOptions, pull} from "../src/utils"
import {CeremonyOptionsWithoutPath} from "../src/types"
import config from "../src/config"

describe('Pull test', () => {
    test('extracts one key from object', () => {
        const object = {
            foo: 'bar',
            baz: 'quz'
        }

        const key = pull(object, 'baz')

        expect(key).toBe('quz')
        expect(object).toEqual({ foo: 'bar' })
    })

    test('extracts invalid key as [undefined]', () => {
        const object = {
            foo: 'bar',
            baz: 'quz'
        }

        // @ts-ignore
        const key = pull(object, 'invalid')

        expect(key).toBe(undefined)
        expect(object).toEqual({ foo: 'bar',  baz: 'quz' })
    })
});

describe('Except test', () => {
    test('returns all keys except some', () => {
        const object = {
            foo: 'bar',
            bar: 'quz',
            qux: 'quux'
        }

        expect(except(object, 'bar')).toEqual({foo: 'bar', qux: 'quux'})
    })

    test('returns all keys by default', () => {
        const object = {
            foo: 'bar',
            bar: 'quz',
            qux: 'quux'
        }

        expect(except(object)).toEqual(object)
    })

    test('returns empty keys if all keys issued', () => {
        const object = {
            foo: 'bar',
            bar: 'quz',
            qux: 'quux'
        }

        expect(except(object, ...Object.keys(object) as keyof object)).toEqual({})
    })
})

describe('Array Buffer test', () => {
    test('array buffer is array buffer', () => {
        const value = new ArrayBuffer(8)

        expect(isArrayBuffer(value)).toBe(true)
    })

    test('Uint8Array is array buffer', () => {
        const value = new Uint8Array()

        expect(isArrayBuffer(value)).toBe(true)
    })

    test('array of integers is array buffer', () => {
        const value = [0, 1, 2, 3, 4]

        expect(isArrayBuffer(value)).toBe(true)
    })

    test('array of binaries is array buffer', () => {
        const value = [0x45, 0x46, 0x47]

        expect(isArrayBuffer(value)).toBe(true)
    })

    test('not array buffers are not array buffers', () => {
        expect(isArrayBuffer({})).toBe(false)
        expect(isArrayBuffer([])).toBe(false)
        expect(isArrayBuffer(['a'])).toBe(false)
        expect(isArrayBuffer('a')).toBe(false)
        expect(isArrayBuffer(0x45)).toBe(false)
        expect(isArrayBuffer(5)).toBe(false)
        expect(isArrayBuffer(() => {})).toBe(false)
        expect(isArrayBuffer(NaN)).toBe(false)
        expect(isArrayBuffer(Infinity)).toBe(false)
        expect(isArrayBuffer(new Uint16Array)).toBe(false)
        expect(isArrayBuffer(new Uint32Array)).toBe(false)
        expect(isArrayBuffer(new Int8Array)).toBe(false)
    })
})

describe('Object Empty test', () => {
    test('empty object is empty', () => {
        expect(isObjectEmpty({})).toBe(true)
    })

    test('filled object is not empty', () => {
        expect(isObjectEmpty({ foo: 'bar' })).toBe(false)
    })

    test('not object is empty', () => {
        expect(isObjectEmpty(true)).toBe(false)
    })
});

describe('Merge Deep test', () => {
    test('merges two objects deeply', () => {
        const target = { foo: { bar: 'quz' } }
        const source = { foo: { baz: 'qux' } }

        const result = mergeDeep(target, source)

        expect(result).toEqual({
            foo: {
                bar: 'quz',
                baz: 'qux',
            },
        })
    })

    test('replaces property if not object', () => {
        const target = { foo: { bar: 'quz' }, bar: [] }
        const source = { foo: { baz: 'qux' }, bar: 4 }

        const result = mergeDeep(target, source)

        expect(result).toEqual({
            foo: {
                bar: 'quz',
                baz: 'qux',
            },
            bar: 4
        })
    })

    test('returns source if target is not object', () => {
        const target = false
        const source = { foo: { baz: 'qux' } }

        // @ts-ignore
        const result = mergeDeep(target, source)

        expect(result).toEqual({ foo: { baz: 'qux' } })
    })

    test('returns target if source is not object', () => {
        const target = { foo: { baz: 'qux' } }
        const source = false

        // @ts-ignore
        const result = mergeDeep(target, source)

        expect(result).toEqual({ foo: { baz: 'qux' } })
    })

    test('returns empty object if source and target not object', () => {
        const target = true
        const source = false

        // @ts-ignore
        const result = mergeDeep(target, source)

        expect(result).toEqual({})
    })
})

describe('Normalize Fetch Options test', () => {
    const defaultConfig = () => config

    test('normalizes option with attest options default path', () => {
        const options: CeremonyOptionsWithoutPath = {
            baseURL: 'test.com'
        }

        const result = normalizeOptions(options, defaultConfig(), "attestOptions")

        expect(result.path).toBe('/auth/attest-options')
        expect(result.baseURL).toBe('test.com')
    })

    test('normalizes option with path and attest default path', () => {
        const options: CeremonyOptionsWithoutPath = {
            path: '/test/',
            baseURL: 'test.com'
        }

        const result = normalizeOptions(options, defaultConfig(), "attest")

        expect(result.path).toBe('/test/')
        expect(result.baseURL).toBe('test.com')
    })

    test('normalizes option with assert default path', () => {
        const options: CeremonyOptionsWithoutPath = {
            baseURL: 'test.com'
        }

        const result = normalizeOptions(options, defaultConfig(), "assert")

        expect(result.path).toBe('/auth/assert')
        expect(result.baseURL).toBe('test.com')
    })

    test('normalizes option with path and assert default path', () => {
        const options: CeremonyOptionsWithoutPath = {
            path: '/test/',
            baseURL: 'test.com'
        }

        const result = normalizeOptions(options, defaultConfig(), "assert")

        expect(result.path).toBe('/test/')
        expect(result.baseURL).toBe('test.com')
    })

    test('normalizes options', () => {
        const options: CeremonyOptionsWithoutPath = {
            method: "foo"
        }

        const result = normalizeOptions(options, defaultConfig(), "assert")

        expect(result.method).toBe('foo')
    })

    test('adds option to normalization', () => {
        const options: CeremonyOptionsWithoutPath = {
            query: ['foo']
        }

        const result = normalizeOptions(options, defaultConfig(), "assert")

        expect(result.query).toEqual(['foo'])
    })

    test('uses option as null', () => {
        const result = normalizeOptions(null, defaultConfig(), "assert")

        expect(result.path).toEqual(defaultConfig().routes.assert)
        expect(result.body).toEqual({})
        expect(result.credentials).toBe(defaultConfig().credentials)
        expect(result.headers).toEqual(defaultConfig().headers)
        expect(result.method).toEqual(defaultConfig().method)
        expect(result.redirect).toEqual(defaultConfig().redirect)
    })

    test('uses option as string', () => {
        const result = normalizeOptions('foo/bar', defaultConfig(), "assert")

        expect(result.path).toEqual('foo/bar')
        expect(result.body).toEqual({})
        expect(result.credentials).toBe(defaultConfig().credentials)
        expect(result.headers).toEqual(defaultConfig().headers)
        expect(result.method).toEqual(defaultConfig().method)
        expect(result.redirect).toEqual(defaultConfig().redirect)
    })
});
