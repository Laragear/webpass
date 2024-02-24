import {CeremonyOptions} from "./types.ts"
import {ofetch} from "ofetch"
import {mergeDeep} from "./utils.ts"

export default async <T>(options: CeremonyOptions, webAuthnData: Object = {}): Promise<T> => {
    const {path, ...fetchOptions} = options

    // @ts-ignore
    fetchOptions.body = mergeDeep(fetchOptions.body ?? {}, webAuthnData)

    return await ofetch<T>(path, fetchOptions)
}
