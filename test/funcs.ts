import BigNumber from "bignumber.js"
import JSBI from "jsbi"
import { LogPowMath } from "../src/swapQuery/library/LogPowMath"

export namespace calc {

    export const q96 = JSBI.BigInt(new BigNumber(2).pow(96).toFixed(0))

    export const floor = (a: BigNumber) : JSBI => {
        return JSBI.BigInt(a.toFixed(0, 3))
    }

    export const ceil = (b: BigNumber): JSBI => {
        return JSBI.BigInt(b.toFixed(0, 2))
    }

    export const divCeil = (a: JSBI, b: JSBI): JSBI => {
        const c = JSBI.divide(a, b)
        const recover = JSBI.multiply(c, b)
        if (JSBI.GT(a, recover)) {
            return JSBI.add(c, JSBI.BigInt(1))
        } else {
            return c
        }
    }

    export const yInRange = (liquidity: string, pl: number, pr: number, rate: number, up: boolean): JSBI => {
        let amountY = new BigNumber(0)
        let price = new BigNumber(rate).pow(pl)
        for (let i = pl; i < pr; i ++) {
            amountY = amountY.plus(new BigNumber(liquidity).times(price.sqrt()))
            price = price.times(rate)
        }
        if (up) {
            return ceil(amountY)
        } else {
            return floor(amountY)
        }
    }

    export const xInRange = (liquidity: string, pl: number, pr: number, rate: number, up: boolean): JSBI => {
        let amountX = new BigNumber(0)
        let price = new BigNumber(rate).pow(pl)
        for (let i = pl; i < pr; i ++) {
            amountX = amountX.plus(new BigNumber(liquidity).div(price.sqrt()))
            price = price.times(rate)
        }
        if (up) {
            return ceil(amountX)
        } else {
            return floor(amountX)
        }
    }

    export const getCostYFromXAt = (sqrtPrice_96: JSBI, acquireX: JSBI): JSBI =>{
        const liquidity = divCeil(
            JSBI.multiply(acquireX, sqrtPrice_96),
            q96
        )
        const costY = divCeil(
            JSBI.multiply(liquidity, sqrtPrice_96),
            q96
        )
        return costY
    }

    export const getCostYFromXAtPoint = (point: number, acquireX: JSBI): JSBI => {
        const sqrtPrice_96 = LogPowMath.getSqrtPrice(point)
        return getCostYFromXAt(sqrtPrice_96, acquireX)
    }

    export const getEarnYFromXAt = (sqrtPrice_96: JSBI, soldX: JSBI): JSBI => {
        const liquidity = JSBI.divide(
            JSBI.multiply(soldX, sqrtPrice_96),
            q96
        )
        const earnY = JSBI.divide(
            JSBI.multiply(liquidity, sqrtPrice_96),
            q96
        )
        return earnY
    }

    export const getEarnYFromXAtPoint = (point: number, soldX: JSBI): JSBI => {
        const sqrtPrice_96 = LogPowMath.getSqrtPrice(point)
        return getEarnYFromXAt(sqrtPrice_96, soldX)
    }

    export const getCostXFromYAt = (sqrtPrice_96: JSBI, acquireY: JSBI): JSBI => {
        const liquidity = divCeil(
            JSBI.multiply(acquireY, q96),
            sqrtPrice_96
        )
        const costX = divCeil(
            JSBI.multiply(liquidity, q96),
            sqrtPrice_96
        )
        return costX
    }

    export const getCostXFromYAtPoint = (point: number, acquireY: JSBI): JSBI => {
        const sqrtPrice_96 = LogPowMath.getSqrtPrice(point)
        return getCostXFromYAt(sqrtPrice_96, acquireY)
    }

    export const getEarnXFromYAt = (sqrtPrice_96: JSBI, soldY: JSBI): JSBI => {
        const liquidity = JSBI.divide(
            JSBI.multiply(soldY, q96),
            sqrtPrice_96
        )
        const costX = JSBI.divide(
            JSBI.multiply(liquidity, q96),
            sqrtPrice_96
        )
        return costX
    }

    export const getEarnXFromYAtPoint = (point: number, soldY: JSBI): JSBI => {
        const sqrtPrice_96 = LogPowMath.getSqrtPrice(point)
        return getEarnXFromYAt(sqrtPrice_96, soldY)
    }

    export const amountAddFee = (amount: JSBI, fee: JSBI): JSBI => {
        const feeAmount = divCeil(JSBI.multiply(amount, fee), JSBI.subtract(JSBI.BigInt(1e6), fee))
        return JSBI.add(amount, feeAmount)
    }

    export const getSum = (amount: JSBI[]): JSBI => {
        return amount.reduce((sum: JSBI, e: JSBI)=>{
            return JSBI.add(sum, e)
        }, JSBI.BigInt(0))
    }

    export const amountListAddFee = (amount: JSBI[], fee: JSBI): JSBI => {
        const amountWithFee = amount.map((e:JSBI)=>amountAddFee(e, fee))
        return getSum(amountWithFee)
    }

    export const l2X = (liquidity: JSBI, sqrtPrice_96: JSBI, up: boolean) => {
        if (up) {
            return divCeil(JSBI.multiply(liquidity, q96), sqrtPrice_96)
        } else {
            return JSBI.divide(JSBI.multiply(liquidity, q96), sqrtPrice_96)
        }
    }

    export const l2Y = (liquidity: JSBI, sqrtPrice_96: JSBI, up: boolean) => {
        if (up) {
            return divCeil(JSBI.multiply(liquidity, sqrtPrice_96), q96)
        } else {
            return JSBI.divide(JSBI.multiply(liquidity, sqrtPrice_96), q96)
        }
    }

}
