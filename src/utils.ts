import {CeremonyOptions, CeremonyOptionsWithoutPath, Config} from "./types"

/**
 * Extracts a single key for the object.
 */
export function pull<T extends Record<string, any>, K extends keyof T>(object: T, key: K): T[K] {
    const extracted = object[key]

    delete object[key]

    return extracted
}

/**
 * Return all object keys except the ones issued.
 */
export function except<T extends Record<string, any>, K extends Array<keyof T>>(object: T, ...keys: K): Partial<T> {
    const result: Partial<T> = {};

    const allKeys = Object.keys(object) as K

    for (const key of allKeys) {
        if (!keys.includes(key)) {
            result[key] = object[key];
        }
    }

    return result;
}

/**
 * Check if an object is a non-empty object.
 */
export function isObjectEmpty(value: any): boolean {
    return typeof value === "object" && !Object.keys(value).length
}

/**
 * Deeply merge an object with another object.
 */
export function mergeDeep<T extends Record<string, any>, S extends Record<string, any>>(target: T, source: S): T & S {
    if (!isObject(target)) {
        return mergeDeep({}, source) as T & S
    }

    const output: Record<string, any> = Object.assign({}, target)

    if (isObject(source)) {
        Object.keys(source).forEach((key: string): void => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, {[key]: source[key]})
                } else {
                    output[key] = mergeDeep(target[key], source[key])
                }
            } else {
                Object.assign(output, {[key]: source[key]})
            }
        })
    }

    return output as T & S
}

/**
 * Check if the value is an object
 */
function isObject(obj: any): boolean {
    return obj !== null && !Array.isArray(obj) && typeof obj === "object" && typeof obj !== "function"
}

/**
 * Normalize the Ceremony options to something fetch-able.
 */
export function normalizeOptions(
    options: CeremonyOptionsWithoutPath | string | undefined | null,
    config: Config,
    defaultPathKey: keyof typeof config.routes
): CeremonyOptions {
    // If the options are empty, create a string with the default route
    if (!options) {
        options = config.routes[defaultPathKey]
    }

    // If the option is a string, create an object with the string as path
    if (typeof options === "string") {
        options = { path: options }
    }

    // If the path in the object is empty, assign it the default route
    options.path = options.path || config.routes[defaultPathKey]
    options.baseURL = options.baseURL || config.baseURL || window.location.origin

    // Set the defaults for the object if these are "falsy"
    options.body = options.body || {}
    options.method = options.method || config.method
    options.headers = options.headers || config.headers
    options.redirect = options.redirect || config.redirect
    options.credentials = options.credentials || config.credentials

    return options as CeremonyOptions
}
