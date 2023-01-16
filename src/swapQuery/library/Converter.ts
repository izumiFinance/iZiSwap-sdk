import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { Consts } from './consts'
export namespace Converter {
    export function toUint128(a: JSBI): JSBI {
        invariant(JSBI.lessThan(a, Consts.Q128), 'C128')
        return a
    }
}