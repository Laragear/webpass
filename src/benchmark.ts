/**
 * Create a small benchmark.
 */
export default (): {start: Date, stop: () => string} => {
    const start = new Date();

    return {
        start,
        stop: (): string => {
            const diffInMs: number = new Date().getTime() - start.getTime()

            const minutes: number = Math.floor(diffInMs / 60000);
            const seconds: number = Number(((diffInMs % 60000) / 1000).toFixed(0));

            return (minutes ? minutes + ' minutes, ' : '') + (seconds ? seconds + ' seconds.' : '')
        }
    }
}
