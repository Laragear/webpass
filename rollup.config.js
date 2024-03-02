import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/index.ts",
    output: [
        {
            file: "dist/webpass.mjs",
            format: "esm",
        },
        {
            name: "Webpass",
            file: "dist/webpass.js",
            format: "iife"
        }
    ],
    plugins: [
        typescript({
            exclude: "tests/**/*",
        }),
        commonjs(),
        nodeResolve(),
        terser()
    ]
};
