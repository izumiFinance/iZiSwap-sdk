import { PriceRoundingType, TickRoundingType, TokenInfoFormatted } from "./types"
import { BigNumber } from 'bignumber.js'

export const priceDecimal2PriceUndecimal = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    priceDecimalAByB: number) : BigNumber => {
    
    // priceDecimalAByB * amountADecimal = amountBDecimal
    // priceDecimalAByB * (amountA / 10^decimalA) = amountB / 10^decimalB
    // priceDecimalAByB / 10^decimalA * 10^decimalB * amountA = amountB

    return new BigNumber(priceDecimalAByB).times(10 ** tokenB.decimal).div(10 ** tokenA.decimal)
}

export const priceUndecimal2PriceDecimal = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    priceUndecimalAByB: BigNumber): number => {
    // priceUndecimalAByB * amountA = amountB
    // priceUndecimalAByB * amountADecimal * 10^decimalA = amountBDecimal * 10^decimalB
    // priceUndecimalAByB * 10^decimalA / 10^decimalB * amountA = amountB
    return Number(priceUndecimalAByB.times(10 ** tokenA.decimal).div(10 **tokenB.decimal))
}

function _xyPriceDecimal2Tick(
    tokenX: TokenInfoFormatted, 
    tokenY: TokenInfoFormatted, 
    priceDecimalXByY: number, 
    roundingType: TickRoundingType): number {
    const priceUndecimalXByY = priceDecimal2PriceUndecimal(tokenX, tokenY, priceDecimalXByY)
    const tick = Math.log(Number(priceUndecimalXByY)) / Math.log(1.0001)
    if (roundingType === TickRoundingType.TICK_ROUNDING_NEAREST) {
        return Math.round(tick)
    } else if (roundingType === TickRoundingType.TICK_ROUNDING_UP) {
        return Math.ceil(tick)
    } else {
        return Math.floor(tick)
    }
}
function _xyPriceUndecimal2Tick(
    priceUndecimalXByY: number, 
    roundingType: TickRoundingType): number {
    const tick = Math.log(priceUndecimalXByY) / Math.log(1.0001)
    if (roundingType === TickRoundingType.TICK_ROUNDING_NEAREST) {
        return Math.round(tick)
    } else if (roundingType === TickRoundingType.TICK_ROUNDING_UP) {
        return Math.ceil(tick)
    } else {
        return Math.floor(tick)
    }
}

export const priceDecimal2Tick = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    priceDecimalAByB: number,
    roundingType: PriceRoundingType): number => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        let tickRoundingType = TickRoundingType.TICK_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_DOWN
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_UP
        }
        return _xyPriceDecimal2Tick(tokenA, tokenB, priceDecimalAByB, tickRoundingType)
    } else {
        let tickRoundingType = TickRoundingType.TICK_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_UP
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_DOWN
        }
        return _xyPriceDecimal2Tick(tokenB, tokenA, 1 / priceDecimalAByB, tickRoundingType)
    }
}

export const priceUndecimal2Tick = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    priceUndecimalAByB: number,
    roundingType: PriceRoundingType): number => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        let tickRoundingType = TickRoundingType.TICK_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_DOWN
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_UP
        }
        return _xyPriceUndecimal2Tick(priceUndecimalAByB, tickRoundingType)
    } else {
        let tickRoundingType = TickRoundingType.TICK_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_UP
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            tickRoundingType = TickRoundingType.TICK_ROUNDING_DOWN
        }
        return _xyPriceUndecimal2Tick(1 / priceUndecimalAByB, tickRoundingType)
    }
}

export const tick2PriceUndecimal = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    tick: number
): BigNumber => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        return new BigNumber(1.0001 ** tick)
    } else {
        return new BigNumber(1).div(1.0001 ** tick)
    }
}

export const getTokenXYFromToken = (tokenA: TokenInfoFormatted, tokenB: TokenInfoFormatted): {tokenX: TokenInfoFormatted, tokenY: TokenInfoFormatted} => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        return {
            tokenX: {...tokenA},
            tokenY: {...tokenB}
        }
    } else {
        return {
            tokenX: {...tokenB},
            tokenY: {...tokenA}
        }
    }
}

export const tick2PriceDecimal = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    tick: number
): number => {
    let priceDecimal = 0;
    let needReverse = false;
    const {tokenX, tokenY} = getTokenXYFromToken(tokenA, tokenB)
    if (tick > 0) {
        priceDecimal = priceUndecimal2PriceDecimal(tokenX, tokenY, new BigNumber(1.0001 ** tick))
        needReverse = tokenA.address.toLowerCase() > tokenB.address.toLowerCase()
    } else {
        priceDecimal = priceUndecimal2PriceDecimal(tokenY, tokenX, new BigNumber(1.0001 ** (-tick)))
        needReverse = tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
    }
    if (needReverse) {
        priceDecimal = 1 / priceDecimal
    }
    return priceDecimal
}

export const tickSpacingRoundingUp = (tick: number, tickSpacing: number) : number => {
    let mod = tick % tickSpacing
    if (mod < 0) {
        mod += tickSpacing
    }
    if (mod === 0) {
        return tick
    } else {
        return tick + tickSpacing - mod
    }
}

export const tickSpacingRoundingDown = (tick: number, tickSpacing: number) : number => {
    let mod = tick % tickSpacing
    if (mod < 0) {
        mod += tickSpacing
    }
    if (mod === 0) {
        return tick
    } else {
        tick - mod
    }
}