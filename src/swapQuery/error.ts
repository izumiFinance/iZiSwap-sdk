import { iZiSwapError, SDKModule } from "../error/types"

export enum SwapQueryErrCode {
    AMOUNT_ZERO_ERROR = 'AMOUNT_ZERO_ERROR',
    HIGHPT_NOT_GREATER_THAN_CURRENTPT_ERROR = 'HIGHPT_NOT_GREATER_THAN_CURRENTPT_ERROR',
    LOWPT_GREATER_THAN_CURRENTPT_ERROR = 'LOWPT_GREATER_THAN_CURRENTPT_ERROR',
    HIGHPT_OVER_ORDER_RANGE_ERROR = 'HIGHPT_OVER_ORDER_RANGE_ERROR',
    LOWPT_OVER_ORDER_RANGE_ERROR = 'LOWPT_OVER_ORDER_RANGE_ERROR',
    CURRENTPT_OVER_ORDER_RANGE_ERROR = 'CURRENTPT_OVER_ORDER_RANGE_ERROR',
    EXCEED_MAXUINT128_ERROR = 'EXCEED_MAXUINT128_ERROR',
    POINT_OVER_RANGE_ERROR = 'POINT_OVER_RANGE_ERROR',
    SQRTPRICE_OVER_RANGE_ERROR = 'SQRTPRICE_OVER_RANGE_ERROR',
}

export class SwapQueryError extends iZiSwapError {
    constructor(code: SwapQueryErrCode, msg: string) {
        super(SDKModule.SWAP_QUERY, code as string, msg)
    }
}

export const swapQueryInvariant = (cond: boolean, code: SwapQueryErrCode, msg: string = ''): void => {
    if (!cond) {
        throw new SwapQueryError(code, msg)
    }
}