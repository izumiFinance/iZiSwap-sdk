import { PriceRoundingType, PointRoundingType, TokenInfoFormatted } from "./types"
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

function _xyPriceDecimal2Point(
    tokenX: TokenInfoFormatted, 
    tokenY: TokenInfoFormatted, 
    priceDecimalXByY: number, 
    roundingType: PointRoundingType): number {
    const priceUndecimalXByY = priceDecimal2PriceUndecimal(tokenX, tokenY, priceDecimalXByY)
    const point = Math.log(Number(priceUndecimalXByY)) / Math.log(1.0001)
    if (roundingType === PointRoundingType.POINT_ROUNDING_NEAREST) {
        return Math.round(point)
    } else if (roundingType === PointRoundingType.POINT_ROUNDING_UP) {
        return Math.ceil(point)
    } else {
        return Math.floor(point)
    }
}
function _xyPriceUndecimal2Point(
    priceUndecimalXByY: number, 
    roundingType: PointRoundingType): number {
    const point = Math.log(priceUndecimalXByY) / Math.log(1.0001)
    if (roundingType === PointRoundingType.POINT_ROUNDING_NEAREST) {
        return Math.round(point)
    } else if (roundingType === PointRoundingType.POINT_ROUNDING_UP) {
        return Math.ceil(point)
    } else {
        return Math.floor(point)
    }
}

export const priceDecimal2Point = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    priceDecimalAByB: number,
    roundingType: PriceRoundingType): number => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        let pointRoundingType = PointRoundingType.POINT_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_DOWN
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_UP
        }
        return _xyPriceDecimal2Point(tokenA, tokenB, priceDecimalAByB, pointRoundingType)
    } else {
        let pointRoundingType = PointRoundingType.POINT_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_UP
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_DOWN
        }
        return _xyPriceDecimal2Point(tokenB, tokenA, 1 / priceDecimalAByB, pointRoundingType)
    }
}

export const priceUndecimal2Point = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    priceUndecimalAByB: number,
    roundingType: PriceRoundingType): number => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        let pointRoundingType = PointRoundingType.POINT_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_DOWN
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_UP
        }
        return _xyPriceUndecimal2Point(priceUndecimalAByB, pointRoundingType)
    } else {
        let pointRoundingType = PointRoundingType.POINT_ROUNDING_NEAREST
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_DOWN) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_UP
        }
        if (roundingType === PriceRoundingType.PRICE_ROUNDING_UP) {
            pointRoundingType = PointRoundingType.POINT_ROUNDING_DOWN
        }
        return _xyPriceUndecimal2Point(1 / priceUndecimalAByB, pointRoundingType)
    }
}

export const point2PoolPriceUndecimalSqrt = (point: number) : number => {
    return (1.0001 ** point) ** 0.5;
}

export const point2PriceUndecimal = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    point: number
): BigNumber => {
    if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
        return new BigNumber(1.0001 ** point)
    } else {
        return new BigNumber(1).div(1.0001 ** point)
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

export const point2PriceDecimal = (
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    point: number
): number => {
    let priceDecimal = 0;
    let needReverse = false;
    const {tokenX, tokenY} = getTokenXYFromToken(tokenA, tokenB)
    if (point > 0) {
        priceDecimal = priceUndecimal2PriceDecimal(tokenX, tokenY, new BigNumber(1.0001 ** point))
        needReverse = tokenA.address.toLowerCase() > tokenB.address.toLowerCase()
    } else {
        priceDecimal = priceUndecimal2PriceDecimal(tokenY, tokenX, new BigNumber(1.0001 ** (-point)))
        needReverse = tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
    }
    if (needReverse) {
        priceDecimal = 1 / priceDecimal
    }
    return priceDecimal
}

export const pointDeltaRoundingUp = (point: number, pointDelta: number) : number => {
    let mod = point % pointDelta
    if (mod < 0) {
        mod += pointDelta
    }
    if (mod === 0) {
        return point
    } else {
        return point + pointDelta - mod
    }
}

export const pointDeltaRoundingDown = (point: number, pointDelta: number) : number => {
    let mod = point % pointDelta
    if (mod < 0) {
        mod += pointDelta
    }
    if (mod === 0) {
        return point
    } else {
        return point - mod
    }
}