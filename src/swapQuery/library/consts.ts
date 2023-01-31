import JSBI from 'jsbi'

export namespace Consts {

    export const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

    export const NEGATIVE_ONE = JSBI.BigInt(-1)
    export const ZERO = JSBI.BigInt(0)
    export const ONE = JSBI.BigInt(1)

    export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
    export const Q128 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128))
    export const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2))

    export const LEFT_MOST_PT = -800000
    export const RIGHT_MOST_PT = 800000

    export const ONE_M = JSBI.BigInt(1e6)

}