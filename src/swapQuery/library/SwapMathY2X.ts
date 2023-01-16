import JSBI from "jsbi";
import { AmountMath } from "./AmountMath";
import { Consts } from "./consts";
import { LogPowMath } from "./LogPowMath";
import { MaxMinMath } from "./MaxMinMath";
import { MulDivMath } from "./MulDivMath";
import { SwapQuery } from "./State";

export namespace SwapMathY2X {

    export interface RangeRetState {
        finished: boolean
        costY: JSBI
        acquireX: JSBI
        finalPt: number
        sqrtFinalPrice_96: JSBI
        liquidityX: JSBI
    }

    export function y2XAtPrice(amountY: JSBI, sqrtPrice_96: JSBI, currX: JSBI): {costY: JSBI, acquireX: JSBI} {
        let l = MulDivMath.mulDivFloor(amountY, Consts.Q96, sqrtPrice_96)
        const acquireX = MaxMinMath.min(
            MulDivMath.mulDivFloor(l, Consts.Q96, sqrtPrice_96),
            currX
        )
        l = MulDivMath.mulDivCeil(acquireX, sqrtPrice_96, Consts.Q96)
        const costY = MulDivMath.mulDivCeil(l, sqrtPrice_96, Consts.Q96)
        return {costY, acquireX}
    }

    export function y2XAtPriceLiquidity(amountY: JSBI, sqrtPrice_96: JSBI, liquidityX: JSBI): {costY: JSBI, acquireX: JSBI, newLiquidityX: JSBI} {
        const maxTransformLiquidityY = MulDivMath.mulDivFloor(amountY, Consts.Q96, sqrtPrice_96)
        const transformLiquidityY = MaxMinMath.min(maxTransformLiquidityY, liquidityX)
        const costY = MulDivMath.mulDivCeil(transformLiquidityY, sqrtPrice_96, Consts.Q96)
        const acquireX = MulDivMath.mulDivFloor(transformLiquidityY, Consts.Q96, sqrtPrice_96)
        const newLiquidityX = JSBI.subtract(liquidityX, transformLiquidityY)
        return {costY, acquireX, newLiquidityX}
    }

    interface Range {
        liquidity: JSBI
        sqrtPriceL_96: JSBI
        leftPt: number
        sqrtPriceR_96: JSBI
        rightPt: number
        sqrtRate_96: JSBI
    }

    interface RangeCompRet {
        costY: JSBI
        acquireX: JSBI
        completeLiquidity: boolean
        locPt: number
        sqrtLoc_96: JSBI
    }

    function y2XRangeComplete(
        rg: Range,
        amountY: JSBI
    ): RangeCompRet {
        const ret = {} as RangeCompRet
        const maxY = AmountMath._getAmountY(rg.liquidity, rg.sqrtPriceL_96, rg.sqrtPriceR_96, rg.sqrtRate_96, true)
        if (JSBI.lessThanOrEqual(maxY, amountY)) {
            ret.costY = maxY
            ret.acquireX = AmountMath._getAmountX(rg.liquidity, rg.leftPt, rg.rightPt, rg.sqrtPriceR_96, rg.sqrtRate_96, false)
            ret.completeLiquidity = true
        } else {
            const sqrtLoc_96 = JSBI.add(
                MulDivMath.mulDivFloor(
                    amountY,
                    JSBI.subtract(rg.sqrtRate_96, Consts.Q96),
                    rg.liquidity
                ),
                rg.sqrtPriceL_96
            );
            ret.locPt = LogPowMath.getLogSqrtPriceFloor(sqrtLoc_96);

            ret.locPt = Math.max(rg.leftPt, ret.locPt);
            ret.locPt = Math.min(rg.rightPt - 1, ret.locPt);

            ret.completeLiquidity = false;
            ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt);
            if (ret.locPt === rg.leftPt) {
                ret.costY = Consts.ZERO;
                ret.acquireX = Consts.ZERO;
                return ret;
            }

            const costY256 = AmountMath._getAmountY(
                rg.liquidity,
                rg.sqrtPriceL_96,
                ret.sqrtLoc_96,
                rg.sqrtRate_96,
                true
            );
            // ret.costY <= amountY <= uint128.max
            ret.costY = MaxMinMath.min(costY256, amountY);

            // costY <= amountY even if the costY is the upperbound of the result
            // because amountY is not a real and sqrtLoc_96 <= sqrtLoc256_96
            ret.acquireX = AmountMath._getAmountX(
                rg.liquidity,
                rg.leftPt,
                ret.locPt,
                ret.sqrtLoc_96,
                rg.sqrtRate_96,
                false
            );
        }
        return ret
    }


    export function y2XRange(
        currentState: SwapQuery.State,
        rightPt: number,
        sqrtRate_96: JSBI,
        originAmountY: JSBI
    ): RangeRetState {
        const retState = {} as RangeRetState
        retState.costY = Consts.ZERO;
        retState.acquireX = Consts.ZERO;
        retState.finished = false;
        let amountY = originAmountY
        // first, if current point is not all x, we can not move right directly
        const startHasY = JSBI.lessThan(currentState.liquidityX, currentState.liquidity);
        if (startHasY) {

            const {costY, acquireX, newLiquidityX}= y2XAtPriceLiquidity(
                amountY, 
                currentState.sqrtPrice_96,
                currentState.liquidityX
            );
            retState.costY = costY
            retState.acquireX = acquireX
            retState.liquidityX = newLiquidityX
            if (JSBI.greaterThanOrEqual(retState.liquidityX, Consts.ZERO) || JSBI.greaterThanOrEqual(retState.costY, amountY)) {
                // it means remaining y is not enough to rise current price to price*1.0001
                // but y may remain, so we cannot simply use (costY == amountY)
                retState.finished = true;
                retState.finalPt = currentState.currentPoint;
                retState.sqrtFinalPrice_96 = currentState.sqrtPrice_96;
                return retState;
            } else {
                // y not run out
                // not finsihed
                amountY = JSBI.subtract(amountY, retState.costY);
                currentState.currentPoint += 1;
                if (currentState.currentPoint === rightPt) {
                    retState.finalPt = currentState.currentPoint;
                    // get fixed sqrt price to reduce accumulated error
                    retState.sqrtFinalPrice_96 = LogPowMath.getSqrtPrice(rightPt);
                    return retState;
                }
                // sqrt(price) + sqrt(price) * (1.0001 - 1) == sqrt(price) * 1.0001
                currentState.sqrtPrice_96 = JSBI.add(
                    currentState.sqrtPrice_96,
                    MulDivMath.mulDivFloor(
                        currentState.sqrtPrice_96,
                        JSBI.subtract(sqrtRate_96, Consts.Q96),
                        Consts.Q96
                    )
                );
            }
        }

        const sqrtPriceR_96 = LogPowMath.getSqrtPrice(rightPt);

        // (uint128 liquidCostY, uint256 liquidAcquireX, bool liquidComplete, int24 locPt, uint160 sqrtLoc_96)
        const ret = y2XRangeComplete(
            {
                liquidity: currentState.liquidity,
                sqrtPriceL_96: currentState.sqrtPrice_96,
                leftPt: currentState.currentPoint,
                sqrtPriceR_96: sqrtPriceR_96,
                rightPt: rightPt,
                sqrtRate_96: sqrtRate_96
            } as Range,
            amountY
        );

        retState.costY = JSBI.add(retState.costY, ret.costY);
        amountY = JSBI.subtract(amountY, ret.costY);
        retState.acquireX = JSBI.add(retState.acquireX, ret.acquireX);
        if (ret.completeLiquidity) {
            retState.finished = JSBI.equal(amountY, Consts.ZERO);
            retState.finalPt = rightPt;
            retState.sqrtFinalPrice_96 = sqrtPriceR_96;
        } else {
            // trade at locPt
            const {costY: locCostY, acquireX: locAcquireX, newLiquidityX} = y2XAtPriceLiquidity(amountY, ret.sqrtLoc_96, currentState.liquidity);
            retState.liquidityX = newLiquidityX

            retState.costY = JSBI.add(retState.costY, locCostY);
            retState.acquireX = JSBI.add(retState.acquireX, locAcquireX);
            retState.finished = true;
            retState.sqrtFinalPrice_96 = ret.sqrtLoc_96;
            retState.finalPt = ret.locPt;
        }
        return retState
    }
}