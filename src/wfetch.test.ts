import {expect, test, vi, describe, beforeEach} from "vitest"
import wfetch from "./wfetch.ts";

vi.mock('ofetch', () => {
    return {
        ofetch: (path: string, options: object) => {
            return { path, options }
        }
    }
})

beforeEach(() => {
    vi.resetModules()
})

describe('Fetch test', () => {
    test('fetch without body', async () => {
        const result = await wfetch({
            path: 'foo-bar',
        }, {
            foo: { quz: 'qux' }
        })

        expect(result).toEqual({
            path: 'foo-bar',
            options: {
                body: { foo: { quz: 'qux'} }
            }
        })
    })

    test('fetch with body merged', async () => {
        const result = await wfetch({
            path: 'foo-bar',
            body: { foo: { bar: 'baz'} }
        }, {
            foo: { quz: 'qux' }
        })

        expect(result).toEqual({
            path: 'foo-bar',
            options: {
                body: { foo: { bar: 'baz' , quz: 'qux'} }
            }
        })
    })
})
