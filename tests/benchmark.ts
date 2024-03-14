import {describe, expect, test, vi} from "vitest"
import benchmark from "../src/benchmark";

describe('Benchmark test', () => {
    test('returns difference of time in seconds', () => {
        vi.setSystemTime(1710400040000)

        const bench = benchmark()

        vi.setSystemTime(1710400051111)

        expect(bench.stop()).toEqual('11 seconds.')
    })

    test('returns difference of time in minutes and seconds', () => {
        vi.setSystemTime(1710400040000)

        const bench = benchmark()

        vi.setSystemTime(1710400151111)

        expect(bench.stop()).toEqual('1 minutes, 51 seconds.')
    })
})
