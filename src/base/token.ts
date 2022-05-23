import { TokenInfoFormatted } from "./types"
import { BigNumber } from 'bignumber.js'

export const amount2Decimal = (amount: BigNumber, token: TokenInfoFormatted): number => {
    return Number(amount.div(10 ** token.decimal))
}

export const decimal2Amount = (amountDecimal: number, token: TokenInfoFormatted): BigNumber => {
    return new BigNumber(amountDecimal).times(10 ** token.decimal)
}