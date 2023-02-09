import { iZiSwapError, SDKModule } from "../error/types"

export enum PoolErrCode {
    LEFTPT_GREATER_THAN_CURRENTPT_ERROR = 'LEFTPT_GREATER_THAN_CURRENTPT_ERROR',
    RIGHTPT_LESS_THAN_CURRENTPT_ERROR = 'RIGHTPT_LESS_THAN_CURRENTPT_ERROR'
}

export class PoolError extends iZiSwapError {
    constructor(code: PoolErrCode, msg: string) {
        super(SDKModule.POOL, code as string, msg)
    }
}

export const poolInvariant = (cond: boolean, code: PoolErrCode, msg: string = ''): void => {
    if (!cond) {
        throw new PoolError(code, msg)
    }
}