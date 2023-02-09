
import JSBI from "jsbi";
import { Converter } from "./Converter";
import { MulDivMath } from "./MulDivMath";
import { MaxMinMath } from "./MaxMinMath";
import { Consts } from "./consts";
import { LogPowMath } from "./LogPowMath";
import { AmountMath } from "./AmountMath";
import { SwapQuery } from "./State";

export namespace SwapMathX2Y {

    export interface RangeRetState {
        finished: boolean
        costX: JSBI
        acquireY: JSBI
        finalPt: number
        sqrtFinalPrice_96: JSBI
        liquidityX: JSBI
    }

    export function x2YAtPrice(
        amountX: JSBI,
        sqrtPrice_96: JSBI,
        currY: JSBI
    ): {costX: JSBI, acquireY: JSBI} {
        let l = MulDivMath.mulDivFloor(amountX, sqrtPrice_96, Consts.Q96)
        let acquireY = Converter.toUint128(
            MulDivMath.mulDivFloor(l, sqrtPrice_96, Consts.Q96)
        )
        if (JSBI.greaterThan(acquireY, currY)) {
            acquireY = currY
        }
        l = MulDivMath.mulDivCeil(acquireY, Consts.Q96, sqrtPrice_96)
        const costX = MulDivMath.mulDivCeil(l, Consts.Q96, sqrtPrice_96)
        return {costX, acquireY}
    }

    function x2YAtPriceLiquidity(
        amountX: JSBI,
        sqrtPrice_96: JSBI,
        liquidity: JSBI,
        liquidityX: JSBI
    ): {costX: JSBI, acquireY: JSBI, newLiquidityX: JSBI} {
        const liquidityY = JSBI.add(liquidity, JSBI.unaryMinus(liquidityX))
        const maxTransformLiquidityX = MulDivMath.mulDivFloor(
            amountX, sqrtPrice_96, Consts.Q96
        )
        const transformLiquidityX = MaxMinMath.min(maxTransformLiquidityX, liquidityY)
        const costX = MulDivMath.mulDivCeil(
            transformLiquidityX,
            Consts.Q96,
            sqrtPrice_96
        )
        const acquireY = MulDivMath.mulDivFloor(
            transformLiquidityX,
            sqrtPrice_96,
            Consts.Q96
        )
        const newLiquidityX = JSBI.add(liquidityX, transformLiquidityX)
        return {costX, acquireY, newLiquidityX}
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
        costX: JSBI
        acquireY: JSBI
        completeLiquidity: boolean
        locPt: number
        sqrtLoc_96: JSBI
    }

    function x2YRangeComplete(rg: Range, amountX: JSBI): RangeCompRet {
        const ret = {} as RangeCompRet
        const sqrtPricePrM1_96 = MulDivMath.mulDivCeil(
            rg.sqrtPriceR_96, Consts.Q96, rg.sqrtRate_96
        )
        const sqrtPricePrMl_96 = LogPowMath.getSqrtPrice(rg.rightPt - rg.leftPt)
        const maxX = MulDivMath.mulDivCeil(
            rg.liquidity, 
            JSBI.add(sqrtPricePrMl_96, JSBI.unaryMinus(Consts.Q96)), 
            JSBI.add(rg.sqrtPriceR_96, JSBI.unaryMinus(sqrtPricePrM1_96))
        );
        if (JSBI.lessThanOrEqual(maxX, amountX)) {
            ret.costX = maxX
            ret.acquireY = AmountMath._getAmountY(rg.liquidity, rg.sqrtPriceL_96, rg.sqrtPriceR_96, rg.sqrtRate_96, false);
            ret.completeLiquidity = true
        } else {
            const sqrtValue_96 = JSBI.add(
                MulDivMath.mulDivFloor(
                    amountX, JSBI.subtract(rg.sqrtPriceR_96, sqrtPricePrM1_96), rg.liquidity
                ),
                Consts.Q96
            )
            const logValue = LogPowMath.getLogSqrtPriceFloor(sqrtValue_96)
            ret.locPt = rg.rightPt - logValue
            ret.locPt = Math.min(ret.locPt, rg.rightPt)
            ret.locPt = Math.max(ret.locPt, rg.leftPt + 1)
            ret.completeLiquidity = false
            if (ret.locPt === rg.rightPt) {
                ret.costX = Consts.ZERO
                ret.acquireY = Consts.ZERO
                ret.locPt = ret.locPt - 1
                ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt)
            } else {
                const sqrtPricePrMloc_96 = LogPowMath.getSqrtPrice(rg.rightPt - ret.locPt)
                ret.costX = MulDivMath.mulDivCeil(
                    rg.liquidity, 
                    JSBI.subtract(sqrtPricePrMloc_96, Consts.Q96),
                    JSBI.subtract(rg.sqrtPriceR_96, sqrtPricePrM1_96)
                )
                ret.costX = MaxMinMath.min(ret.costX, amountX)
                ret.locPt = ret.locPt - 1
                ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt)
                const sqrtLocA1_96 = JSBI.add(
                    ret.sqrtLoc_96,
                    MulDivMath.mulDivFloor(
                        ret.sqrtLoc_96,
                        JSBI.subtract(rg.sqrtRate_96, Consts.Q96),
                        Consts.Q96
                    )
                )
                ret.acquireY = AmountMath._getAmountY(rg.liquidity, sqrtLocA1_96, rg.sqrtPriceR_96, rg.sqrtRate_96, false)
            }
        }

        return ret

    }

    export function x2YRange(
        currentState: SwapQuery.State,
        leftPt: number,
        sqrtRate_96: JSBI,
        originAmountX: JSBI
    ) : RangeRetState {
        const retState = {} as RangeRetState
        retState.costX = Consts.ZERO
        retState.acquireY = Consts.ZERO
        retState.finished = false
        const currentHasY = JSBI.lessThan(currentState.liquidityX, currentState.liquidity)

        let amountX = JSBI.BigInt(originAmountX)

        if (currentHasY && (JSBI.notEqual(currentState.liquidityX, Consts.ZERO) || leftPt === currentState.currentPoint)) {
            const {costX, acquireY, newLiquidityX} = x2YAtPriceLiquidity(
                amountX, currentState.sqrtPrice_96, currentState.liquidity, currentState.liquidityX
            );
            retState.costX = costX
            retState.acquireY = acquireY
            retState.liquidityX = newLiquidityX
            if (JSBI.LT(retState.liquidityX, currentState.liquidity) ||  JSBI.GE(retState.costX, amountX)) {
                // remaining x is not enough to down current price to price / 1.0001
                // but x may remain, so we cannot simply use (costX == amountX)
                retState.finished = true;
                retState.finalPt = currentState.currentPoint;
                retState.sqrtFinalPrice_96 = currentState.sqrtPrice_96;
            } else {
                amountX = JSBI.subtract(amountX, retState.costX)
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
            retState.liquidityX = currentState.liquidityX
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
                amountX
            );
            retState.costX = JSBI.add(retState.costX, ret.costX)
            amountX = JSBI.subtract(amountX, ret.costX)
            retState.acquireY = JSBI.add(retState.acquireY, ret.acquireY)

            if (ret.completeLiquidity) {
                retState.finished = JSBI.equal(amountX, Consts.ZERO);
                retState.finalPt = leftPt;
                retState.sqrtFinalPrice_96 = sqrtPriceL_96;
                retState.liquidityX = currentState.liquidity;
            } else {
                
                const {costX: locCostX, acquireY: locAcquireY, newLiquidityX: retLiquidityX} = x2YAtPriceLiquidity(amountX, ret.sqrtLoc_96, currentState.liquidity, Consts.ZERO);
                retState.liquidityX = retLiquidityX
                retState.costX = JSBI.add(retState.costX, locCostX)
                retState.acquireY = JSBI.add(retState.acquireY, locAcquireY)
                retState.finished = true;
                retState.sqrtFinalPrice_96 = ret.sqrtLoc_96;
                retState.finalPt = ret.locPt;
            }
        } else {
            // finishd must be false
            // retState.finished == false;
            // liquidityX has been set
            retState.finalPt = currentState.currentPoint;
            retState.sqrtFinalPrice_96 = currentState.sqrtPrice_96;
        }
        return retState
    }


}