export enum SDKModule {
    SWAP_QUERY = 'SWAP_QUERY'
}

export class iZiSwapError extends Error {
    code: string
    module: SDKModule
    constructor(module: SDKModule, code: string, msg: string = '') {
        super(msg)
        this.code = code
        this.module = module
    }
}

