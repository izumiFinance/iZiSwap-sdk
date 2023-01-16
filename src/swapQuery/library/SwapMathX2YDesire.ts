import JSBI from 'jsbi'
import { MulDivMath } from './MulDivMath'
import { Consts } from './consts'
import { Converter } from './Converter'
import { MaxMinMath } from './MaxMinMath'
import { AmountMath } from './AmountMath'
import { LogPowMath } from './LogPowMath'
import { SwapQuery } from './State'

export namespace SwapMathX2YDesire {

    export interface RangeRetState {
        finished: boolean
        costX: JSBI
        acquireY: JSBI
        finalPt: number
        sqrtFinalPrice_96: JSBI
        liquidityX: JSBI
    }

    export function x2YAtPrice(
        desireY: JSBI,
        sqrtPrice_96: JSBI,
        currY: JSBI
    ): {costX: JSBI, acquireY: JSBI} {
        let acquireY = desireY
        if (JSBI.greaterThan(acquireY, currY)) {
            acquireY = currY
        }
        const l = MulDivMath.mulDivCeil(acquireY, Consts.Q96, sqrtPrice_96)
        const costX = Converter.toUint128(
            MulDivMath.mulDivCeil(l, Consts.Q96, sqrtPrice_96)
        )
        return {costX, acquireY}
    }

    export function x2YAtPriceLiquidity(
        desireY: JSBI,
        sqrtPrice_96: JSBI,
        liquidity: JSBI,
        liquidityX: JSBI
    ): {costX: JSBI, acquireY: JSBI, newLiquidityX: JSBI} {
        const liquidityY = JSBI.subtract(liquidity, liquidityX)
        const maxTransformLiquidityX = MulDivMath.mulDivCeil(desireY, Consts.Q96, sqrtPrice_96);
        // transformLiquidityX <= liquidityY <= uint128.max
        const transformLiquidityX = MaxMinMath.min(maxTransformLiquidityX, liquidityY);
        // transformLiquidityX * 2^96 <= 2^128 * 2^96 <= 2^224 < 2^256
        const costX = MulDivMath.mulDivCeil(transformLiquidityX, Consts.Q96, sqrtPrice_96);
        // acquireY should not > uint128.max
        const acquireY256 = MulDivMath.mulDivFloor(transformLiquidityX, sqrtPrice_96, Consts.Q96);
        const acquireY = Converter.toUint128(acquireY256);
        const newLiquidityX = JSBI.add(liquidityX, transformLiquidityX);
        return {costX, acquireY, newLiquidityX}
    }

    interface Range {
        liquidity: JSBI,
        sqrtPriceL_96: JSBI,
        leftPt: number,
        sqrtPriceR_96: JSBI,
        rightPt: number,
        sqrtRate_96: JSBI
    }

    interface RangeCompRet {
        costX: JSBI,
        acquireY: JSBI,
        completeLiquidity: boolean,
        locPt: number,
        sqrtLoc_96: JSBI
    }

    function x2YRangeComplete(rg: Range, desireY: JSBI): RangeCompRet {
        const ret = {} as RangeCompRet
        const maxY = AmountMath._getAmountY(rg.liquidity, rg.sqrtPriceL_96, rg.sqrtPriceR_96, rg.sqrtRate_96, false)
        if (JSBI.lessThanOrEqual(maxY, desireY)) {
            ret.acquireY = maxY
            ret.costX = AmountMath._getAmountX(
                rg.liquidity, rg.leftPt, rg.rightPt, rg.sqrtPriceR_96, rg.sqrtRate_96, true
            )
            ret.completeLiquidity = true
            return ret
        }
        const cl = JSBI.subtract(
            rg.sqrtPriceR_96,
            MulDivMath.mulDivFloor(desireY, JSBI.subtract(rg.sqrtRate_96, Consts.Q96), rg.liquidity)
        )
        ret.locPt = LogPowMath.getLogSqrtPriceFloor(cl) + 1
        
        ret.locPt = Math.min(ret.locPt, rg.rightPt)
        ret.locPt = Math.max(ret.locPt, rg.leftPt + 1)
        ret.completeLiquidity = false

        if (ret.locPt === rg.rightPt) {
            ret.costX = Consts.ZERO;
            ret.acquireY = Consts.ZERO;
            ret.locPt = ret.locPt - 1;
            ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt);
        } else {
            // rg.rightPt - ret.locPt <= 256 * 100
            // sqrtPricePrMloc_96 <= 1.0001 ** 25600 * 2 ^ 96 = 13 * 2^96 < 2^100
            const sqrtPricePrMloc_96 = LogPowMath.getSqrtPrice(rg.rightPt - ret.locPt);
            // rg.sqrtPriceR_96 * TwoPower.Pow96 < 2^160 * 2^96 = 2^256
            const sqrtPricePrM1_96 = MulDivMath.mulDivCeil(rg.sqrtPriceR_96, Consts.Q96, rg.sqrtRate_96);
            // rg.liquidity * (sqrtPricePrMloc_96 - TwoPower.Pow96) < 2^128 * 2^100 = 2^228 < 2^256
            ret.costX = MulDivMath.mulDivCeil(
                rg.liquidity, 
                JSBI.subtract(sqrtPricePrMloc_96, Consts.Q96), 
                JSBI.subtract(rg.sqrtPriceR_96, sqrtPricePrM1_96)
            )

            ret.locPt = ret.locPt - 1;
            ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt);

            const sqrtLocA1_96 = JSBI.add(
                ret.sqrtLoc_96,
                MulDivMath.mulDivCeil(
                    ret.sqrtLoc_96, JSBI.subtract(rg.sqrtRate_96, Consts.Q96), Consts.Q96
                )
            );
            ret.acquireY = AmountMath._getAmountY(rg.liquidity, sqrtLocA1_96, rg.sqrtPriceR_96, rg.sqrtRate_96, false);
            // ret.acquireY <= desireY <= uint128.max
        }
        return ret;
    }


    export function x2YRange(
        currentState: SwapQuery.State,
        leftPt: number,
        sqrtRate_96: JSBI,
        originDesireY: JSBI
    ) : RangeRetState {
        const retState = {} as RangeRetState
        retState.costX = Consts.ZERO;
        retState.acquireY = Consts.ZERO;
        retState.finished = false;

        let desireY = originDesireY

        const currentHasY = JSBI.lessThan(currentState.liquidityX, currentState.liquidity);
        if (currentHasY && (JSBI.greaterThan(currentState.liquidityX, Consts.ZERO) || leftPt === currentState.currentPoint)) {

            const {costX, acquireY, newLiquidityX} = x2YAtPriceLiquidity(
                desireY, currentState.sqrtPrice_96, currentState.liquidity, currentState.liquidityX
            );
            retState.costX = costX
            retState.acquireY = acquireY
            retState.liquidityX = newLiquidityX

            if (JSBI.lessThan(retState.liquidityX, currentState.liquidity) || JSBI.greaterThanOrEqual(retState.acquireY, desireY)) {
                // remaining desire y is not enough to down current price to price / 1.0001
                // but desire y may remain, so we cannot simply use (retState.acquireY >= desireY)
                retState.finished = true;
                retState.finalPt = currentState.currentPoint;
                retState.sqrtFinalPrice_96 = currentState.sqrtPrice_96;
            } else {
                desireY = JSBI.subtract(desireY, retState.acquireY);
            }
        } else if (currentHasY) { // all y
            currentState.currentPoint = currentState.currentPoint + 1;
            // sqrt(price) + sqrt(price) * (1.0001 - 1) == sqrt(price) * 1.0001
            currentState.sqrtPrice_96 = JSBI.add(
                currentState.sqrtPrice_96,
                MulDivMath.mulDivFloor(
                    currentState.sqrtPrice_96,
                    JSBI.subtract(sqrtRate_96, Consts.Q96),
                    Consts.Q96
                )
            )
        } else {
            retState.liquidityX = currentState.liquidityX;
        }
        if (retState.finished) {
            return retState;
        }

        if (leftPt < currentState.currentPoint) {
            const sqrtPriceL_96 = LogPowMath.getSqrtPrice(leftPt);
            const ret = x2YRangeComplete(
                {
                    liquidity: currentState.liquidity,
                    sqrtPriceL_96: sqrtPriceL_96,
                    leftPt: leftPt,
                    sqrtPriceR_96: currentState.sqrtPrice_96,
                    rightPt: currentState.currentPoint,
                    sqrtRate_96: sqrtRate_96
                } as Range, 
                desireY
            );
            retState.costX = JSBI.add(retState.costX, ret.costX);
            desireY = JSBI.subtract(desireY, ret.acquireY);
            retState.acquireY = JSBI.add(retState.acquireY, ret.acquireY);
            if (ret.completeLiquidity) {
                retState.finished = JSBI.equal(desireY, Consts.ZERO);
                retState.finalPt = leftPt;
                retState.sqrtFinalPrice_96 = sqrtPriceL_96;
                retState.liquidityX = currentState.liquidity;
            } else {
                // trade at locPt
                const {costX: locCostX, acquireY: locAcquireY, newLiquidityX} = x2YAtPriceLiquidity(
                    desireY, ret.sqrtLoc_96, currentState.liquidity, Consts.ZERO
                );
                retState.liquidityX = newLiquidityX

                retState.costX = JSBI.add(retState.costX, locCostX);
                retState.acquireY = JSBI.add(retState.acquireY, locAcquireY);
                retState.finished = true;
                retState.sqrtFinalPrice_96 = ret.sqrtLoc_96;
                retState.finalPt = ret.locPt;
            }
        } else {
            // finishd must be false
            // retState.finished == false;
            retState.finalPt = currentState.currentPoint;
            retState.sqrtFinalPrice_96 = currentState.sqrtPrice_96;
        }
        return retState
    }
}