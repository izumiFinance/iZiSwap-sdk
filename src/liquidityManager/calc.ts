import Web3 from "web3"
import liquidityManagerAbi from './abi.json'

import { BigNumber } from 'bignumber.js'
import { TokenInfoFormatted } from "../base/types"
import { 
    _getAmountX,
    _getAmountY,
    _liquidity2AmountXAtPoint,
    _liquidity2AmountYAtPoint,
    _calciZiLiquidityAmountY, 
    _calciZiLiquidityAmountX 
} from './library/amountMath'
import { Liquidity } from "./types"
import { point2PoolPriceUndecimalSqrt } from "../base/price"
import { BaseState, State } from "../pool/types"
import { amount2Decimal, getSwapTokenAddress } from "../base/token/token"


export const calciZiLiquidityAmountDesired = (
    leftPoint: number,
    rightPoint: number,
    currentPoint: number,
    amount: BigNumber,
    amountIsTokenA: boolean,
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
): BigNumber => {
    if (amountIsTokenA) {
        if (getSwapTokenAddress(tokenA).toLowerCase() < getSwapTokenAddress(tokenB).toLowerCase()) {
            return _calciZiLiquidityAmountY(amount, leftPoint, rightPoint, currentPoint);
        } else {
            return _calciZiLiquidityAmountX(amount, leftPoint, rightPoint, currentPoint);
        }
    } else {
        if (getSwapTokenAddress(tokenA).toLowerCase() < getSwapTokenAddress(tokenB).toLowerCase()) {
            return _calciZiLiquidityAmountX(amount, leftPoint, rightPoint, currentPoint);
        } else {
            return _calciZiLiquidityAmountY(amount, leftPoint, rightPoint, currentPoint);
        }
    }
}


export const getLiquidityValue = (
    liquidity: Liquidity,
    state: BaseState
): {amountXDecimal: number, amountYDecimal: number, amountX: BigNumber, amountY: BigNumber} => {
    
    let amountX = new BigNumber(0);
    let amountY = new BigNumber(0);
    const liquid = liquidity.liquidity;
    const sqrtRate = Math.sqrt(1.0001);
    const leftPtNum = Number(liquidity.leftPoint);
    const rightPtNum = Number(liquidity.rightPoint);
    // compute amountY without currentPt
    if (leftPtNum < state.currentPoint) {
        const rightPt: number = Math.min(state.currentPoint, rightPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPt);
        const sqrtPriceL = point2PoolPriceUndecimalSqrt(leftPtNum);
        amountY = _getAmountY(new BigNumber(liquid), sqrtPriceL, sqrtPriceR, sqrtRate, false);
    }
    
    // compute amountX without currentPt
    if (rightPtNum > state.currentPoint + 1) {
        const leftPt: number = Math.max(state.currentPoint + 1, leftPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPtNum);
        amountX = _getAmountX(new BigNumber(liquid), leftPt, rightPtNum, sqrtPriceR, sqrtRate, false);
    }

    // compute amountX and amountY on currentPt
    if (leftPtNum <= state.currentPoint && rightPtNum > state.currentPoint) {
        const liquidityValue = new BigNumber(liquidity.liquidity);
        const maxLiquidityYAtCurrentPt = new BigNumber(state.liquidity).minus(state.liquidityX);
        const liquidityYAtCurrentPt = liquidityValue.gt(maxLiquidityYAtCurrentPt) ? maxLiquidityYAtCurrentPt : liquidityValue;
        const liquidityXAtCurrentPt = liquidityValue.minus(liquidityYAtCurrentPt);
        const currentSqrtPrice = point2PoolPriceUndecimalSqrt(state.currentPoint);
        amountX = amountX.plus(_liquidity2AmountXAtPoint(liquidityXAtCurrentPt, currentSqrtPrice, false));
        amountY = amountY.plus(_liquidity2AmountYAtPoint(liquidityYAtCurrentPt, currentSqrtPrice, false));
    }
    const amountXDecimal:number = amount2Decimal(
        amountX, liquidity.tokenX
    )?? 0;
    const amountYDecimal:number = amount2Decimal(
        amountY, liquidity.tokenY
    )?? 0;
    return {
        amountX, amountXDecimal,
        amountY, amountYDecimal
    };
}

export const getWithdrawLiquidityValue = (
    liquidity: Liquidity,
    state: BaseState,
    withdrawLiquidity: BigNumber
): {amountXDecimal: number, amountYDecimal: number, amountX: BigNumber, amountY: BigNumber} => {
    
    let amountX = new BigNumber(0);
    let amountY = new BigNumber(0);

    const sqrtRate = Math.sqrt(1.0001);
    const leftPtNum = Number(liquidity.leftPoint);
    const rightPtNum = Number(liquidity.rightPoint);
    // compute amountY without currentPt
    if (leftPtNum < state.currentPoint) {
        const rightPt: number = Math.min(state.currentPoint, rightPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPt);
        const sqrtPriceL = point2PoolPriceUndecimalSqrt(leftPtNum);
        amountY = _getAmountY(withdrawLiquidity, sqrtPriceL, sqrtPriceR, sqrtRate, false);
    }
    
    // compute amountX without currentPt
    if (rightPtNum > state.currentPoint + 1) {
        const leftPt: number = Math.max(state.currentPoint + 1, leftPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPtNum);
        amountX = _getAmountX(withdrawLiquidity, leftPt, rightPtNum, sqrtPriceR, sqrtRate, false);
    }

    // compute amountX and amountY on currentPt
    if (leftPtNum <= state.currentPoint && rightPtNum > state.currentPoint) {
        const liquidityValue = withdrawLiquidity;
        const maxLiquidityYAtCurrentPt = new BigNumber(state.liquidity).minus(state.liquidityX);
        const liquidityYAtCurrentPt = liquidityValue.gt(maxLiquidityYAtCurrentPt) ? maxLiquidityYAtCurrentPt : liquidityValue;
        const liquidityXAtCurrentPt = liquidityValue.minus(liquidityYAtCurrentPt);
        const currentSqrtPrice = point2PoolPriceUndecimalSqrt(state.currentPoint);
        amountX = amountX.plus(_liquidity2AmountXAtPoint(liquidityXAtCurrentPt, currentSqrtPrice, false));
        amountY = amountY.plus(_liquidity2AmountYAtPoint(liquidityYAtCurrentPt, currentSqrtPrice, false));
    }
    const amountXDecimal:number = amount2Decimal(
        amountX, liquidity.tokenX
    )?? 0;
    const amountYDecimal:number = amount2Decimal(
        amountY, liquidity.tokenY
    )?? 0;
    return {
        amountX, amountXDecimal,
        amountY, amountYDecimal
    };
}