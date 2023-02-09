import JSBI from 'jsbi'
import { SwapQueryErrCode, swapQueryInvariant } from '../error'
import { Consts } from './consts'
export namespace Converter {
    export function toUint128(a: JSBI): JSBI {
        swapQueryInvariant(JSBI.lessThan(a, Consts.Q128), SwapQueryErrCode.EXCEED_MAXUINT128_ERROR)
        return a
    }
}