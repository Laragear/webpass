import {configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        include: ["tests/**/*.ts"],
        coverage: {
            exclude: [
                ...configDefaults.coverage.exclude ?? [],
                'src/index.ts',
                'src/config.ts',
                'src/types.ts',
            ]
        }
    },
})
