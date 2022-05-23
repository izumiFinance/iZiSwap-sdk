import {BigNumber} from 'bignumber.js'

export const _getAmountY = (
    liquidity: BigNumber,
    sqrtPriceL: number,
    sqrtPriceR: number,
    sqrtRate: number,
    upper: boolean,
): BigNumber => {
    const numerator = sqrtPriceR - sqrtPriceL;
    const denominator = sqrtRate - 1;
    if (!upper) {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 3));
        return amount;
    } else {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 2));
        return amount;
    }
}

export const _liquidity2AmountYAtPoint = (
    liquidity: BigNumber,
    sqrtPrice: number,
    upper: boolean
): BigNumber => {
    const amountY = liquidity.times(sqrtPrice);
    if (!upper) {
        return new BigNumber(amountY.toFixed(0, 3));
    } else {
        return new BigNumber(amountY.toFixed(0, 2));
    }
}

export const _getAmountX = (
    liquidity: BigNumber,
    leftPt: number,
    rightPt: number,
    sqrtPriceR: number,
    sqrtRate: number,
    upper: boolean,
): BigNumber => {
    const sqrtPricePrPc = Math.pow(sqrtRate, rightPt - leftPt + 1);
    const sqrtPricePrPd = Math.pow(sqrtRate, rightPt + 1);

    const numerator = sqrtPricePrPc - sqrtRate;
    const denominator = sqrtPricePrPd - sqrtPriceR;

    if (!upper) {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 3));
        return amount;
    } else {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 2));
        return amount;
    }
}

export const _liquidity2AmountXAtPoint = (
    liquidity: BigNumber,
    sqrtPrice: number,
    upper: boolean
): BigNumber => {
    const amountX = liquidity.div(sqrtPrice);
    if (!upper) {
        return new BigNumber(amountX.toFixed(0, 3));
    } else {
        return new BigNumber(amountX.toFixed(0, 2));
    }
}

export const _getAmountYNoRound = (
    liquidity: BigNumber,
    sqrtPriceL: number,
    sqrtPriceR: number,
    sqrtRate: number,
): BigNumber => {
    const numerator = sqrtPriceR - sqrtPriceL;
    const denominator = sqrtRate - 1;
    const amount = liquidity.times(numerator).div(denominator);
    return amount;
}

export const _getAmountXNoRound = (
    liquidity: BigNumber,
    leftPt: number,
    rightPt: number,
    sqrtPriceR: number,
    sqrtRate: number,
): BigNumber => {
    const sqrtPricePrPc = Math.pow(sqrtRate, rightPt - leftPt + 1);
    const sqrtPricePrPd = Math.pow(sqrtRate, rightPt + 1);

    const numerator = sqrtPricePrPc - sqrtRate;
    const denominator = sqrtPricePrPd - sqrtPriceR;

    const amount = liquidity.times(numerator).div(denominator);
    return amount;
}


export const _calciZiLiquidityAmountY = (
    amountX: BigNumber,
    leftPoint: number,
    rightPoint: number,
    currentPoint: number
): BigNumber => {
    // console.log(' -- calc amount of iZiSwapPool::tokenY');
    if (leftPoint > currentPoint) {
        // console.log(' -- no need to deposit iZiSwapPool::tokenY');
        return new BigNumber(0);
    }
    if (rightPoint <= currentPoint) {
        // console.log(' -- no need to deposit iZiSwapPool::tokenX');
        return new BigNumber(0);
    }
    const sqrtRate = Math.sqrt(1.0001);
    const sqrtPriceR = Math.pow(sqrtRate, rightPoint);
    const unitLiquidityAmountX = _getAmountXNoRound(new BigNumber(1), currentPoint + 1, rightPoint, sqrtPriceR, sqrtRate);
    const liquidityFloat = amountX.div(unitLiquidityAmountX);

    const sqrtPriceL = Math.pow(sqrtRate, leftPoint);
    const sqrtPricecurrentPointA1 = Math.pow(sqrtRate, currentPoint + 1);
    const amountY = _getAmountY(liquidityFloat, sqrtPriceL, sqrtPricecurrentPointA1, sqrtRate, true);

    return amountY;
}

export const _calciZiLiquidityAmountX = (
    amountY: BigNumber,
    leftPoint: number,
    rightPoint: number,
    currentPoint: number
): BigNumber => {
    // console.log(' -- calc amount of iZiSwapPool::tokenX');
    if (rightPoint <= currentPoint) {
        // console.log(' -- no need to deposit iZiSwapPool::tokenX');
        return new BigNumber(0);
    }
    if (leftPoint > currentPoint) {
        // console.log(' -- no need to deposit iZiSwapPool::tokenY');
        return new BigNumber(0);
    }

    const sqrtRate = Math.sqrt(1.0001);
    const sqrtPriceL = Math.pow(sqrtRate, leftPoint);
    const sqrtPricecurrentPointA1 = Math.pow(sqrtRate, currentPoint + 1);
    const unitLiquidityAmountY = _getAmountYNoRound(new BigNumber(1), sqrtPriceL, sqrtPricecurrentPointA1, sqrtRate);
    const liquidityFloat = amountY.div(unitLiquidityAmountY);

    const sqrtPriceR = Math.pow(sqrtRate, rightPoint);
    const amountX = _getAmountX(liquidityFloat, currentPoint + 1, rightPoint, sqrtPriceR, sqrtRate, true);

    return amountX;
}
