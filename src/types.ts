import type {FetchOptions} from "ofetch"

export interface Endpoints extends Record<string, string> {
    attestOptions: string,
    attest: string,
    assertOptions: string,
    assert: string,
}

export interface Config extends Partial<FetchOptions<"json">> {
    routes: Endpoints,
    findCsrfToken: boolean|string,
    findXsrfToken: boolean|string,
    useAutofill: boolean|undefined,
    method: "get" | "post" | string,
    redirect: RequestRedirect,
    baseURL: string | undefined,
    headers: Record<string, string>,
    credentials: RequestCredentials,
}

export interface CeremonyOptions extends Partial<Config> {
    path: string,
}

export type CeremonyOptionsWithoutPath = Omit<CeremonyOptions, "path"> & { path?: string }

export type CeremonyResultRaw = Record<string, any> | string | undefined

interface CeremonyResult {
    data: CeremonyResultRaw,
    success: boolean,
    error: Error | undefined | unknown,
}

export interface AttestationResult extends CeremonyResult {
    credentials: CeremonyResult["data"],
    id: string | number | undefined,
}

export interface AssertionResult extends CeremonyResult {
    user: CeremonyResult["data"],
    token: string | undefined,
}

type Ceremony<T> = (options?: string | CeremonyOptionsWithoutPath, response?: string | CeremonyOptionsWithoutPath) => Promise<T>

export interface Webpass {
    attest: Ceremony<AttestationResult>,
    assert:  Ceremony<AssertionResult>,
    attestRaw: Ceremony<CeremonyResultRaw>,
    assertRaw: Ceremony<CeremonyResultRaw>,
}

export interface WebpassStatic extends Webpass {
    create: (config?: Partial<Config>) => Webpass,
    isSupported: () => boolean,
    isNotSupported: () => boolean,
    isUnsupported: () => boolean,
    isAutofillable: () => Promise<boolean>,
    isNotAutofillable: () => Promise<boolean>,
    isPlatformAuthenticator: () => Promise<boolean>,
    isNotPlatformAuthenticator: () => Promise<boolean>,
}

export interface ServerPublicKeyCredentialCreationOptions extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'user' | 'excludeCredentials'> {
    challenge: string,
    user: { id: string, name: string, displayName: string },
    excludeCredentials: { id: string, type: "public-key" }[]
}

export interface ServerPublicKeyCredentialRequestOptions extends Omit<PublicKeyCredentialRequestOptions, 'challenge' | 'allowCredentials'> {
    challenge: string,
    allowCredentials: { id: string, type: "public-key" }[]
}
