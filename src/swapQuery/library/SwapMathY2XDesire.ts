import JSBI from "jsbi";
import { MaxMinMath } from "./MaxMinMath";
import { MulDivMath } from "./MulDivMath";
import { Consts } from "./consts";
import { Converter } from "./Converter";
import { AmountMath } from "./AmountMath";
import { LogPowMath } from "./LogPowMath";
import { SwapQuery } from "./State";

export namespace SwapMathY2XDesire {

    export interface RangeRetState {
        finished: boolean
        costY: JSBI
        acquireX: JSBI
        finalPt: number
        sqrtFinalPrice_96: JSBI
        liquidityX: JSBI
    }

    export function y2XAtPrice(
        desireX: JSBI,
        sqrtPrice_96: JSBI,
        currX: JSBI
    ): {costY: JSBI, acquireX: JSBI} {
        const acquireX = MaxMinMath.min(desireX, currX)
        const l = MulDivMath.mulDivCeil(acquireX, sqrtPrice_96, Consts.Q96)
        const costY = Converter.toUint128(MulDivMath.mulDivCeil(l, sqrtPrice_96, Consts.Q96))
        return {costY, acquireX}
    }

    export function y2XAtPriceLiquidity(
        desireX: JSBI,
        sqrtPrice_96: JSBI,
        liquidityX: JSBI
    ): {costY: JSBI, acquireX: JSBI, newLiquidityX: JSBI} {
        const maxTransformLiquidityY = MulDivMath.mulDivCeil(desireX, sqrtPrice_96, Consts.Q96);
        // transformLiquidityY <= liquidityX <= uint128.max
        const transformLiquidityY = MaxMinMath.min(maxTransformLiquidityY, liquidityX);
        const costY = MulDivMath.mulDivCeil(transformLiquidityY, sqrtPrice_96, Consts.Q96);
        // transformLiquidityY * TwoPower.Pow96 < 2^128 * 2^96 = 2^224 < 2^256
        const acquireX = Converter.toUint128(MulDivMath.mulDivFloor(transformLiquidityY, Consts.Q96, sqrtPrice_96));
        const newLiquidityX = JSBI.subtract(liquidityX, transformLiquidityY);
        return {costY, acquireX, newLiquidityX}
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
        costY: JSBI,
        acquireX: JSBI,
        completeLiquidity: boolean,
        locPt: number,
        sqrtLoc_96: JSBI
    }


    function y2XRangeComplete(
        rg: Range,
        desireX: JSBI
    ): RangeCompRet {
        const ret = {} as RangeCompRet
        const maxX = AmountMath._getAmountX(rg.liquidity, rg.leftPt, rg.rightPt, rg.sqrtPriceR_96, rg.sqrtRate_96, false);
        if (JSBI.lessThanOrEqual(maxX, desireX)) {
            // maxX <= desireX <= uint128.max
            ret.acquireX = maxX;
            ret.costY = AmountMath._getAmountY(rg.liquidity, rg.sqrtPriceL_96, rg.sqrtPriceR_96, rg.sqrtRate_96, true);
            ret.completeLiquidity = true;
            return ret;
        }

        const sqrtPricePrPl_96 = LogPowMath.getSqrtPrice(rg.rightPt - rg.leftPt);
        // rg.sqrtPriceR_96 * 2^96 < 2^160 * 2^96 = 2^256
        const sqrtPricePrM1_96 = MulDivMath.mulDivFloor(rg.sqrtPriceR_96, Consts.Q96, rg.sqrtRate_96);

        // div must be > 2^96 because, if
        //  div <= 2^96
        //  <=>  sqrtPricePrPl_96 - desireX * (sqrtPriceR_96 - sqrtPricePrM1_96) / liquidity <= 2^96 (here, '/' is div of int)
        //  <=>  desireX >= (sqrtPricePrPl_96 - 2^96) * liquidity / (sqrtPriceR_96 - sqrtPricePrM1_96) 
        //  <=>  desireX >= maxX
        //  will enter the branch above and return
        const div = JSBI.subtract(
            sqrtPricePrPl_96, MulDivMath.mulDivFloor(desireX, JSBI.subtract(rg.sqrtPriceR_96, sqrtPricePrM1_96), rg.liquidity)
        );

        // 1. rg.sqrtPriceR_96 * 2^96 < 2^160 * 2^96 = 2^256
        // 2. sqrtPriceLoc_96 must < rg.sqrtPriceR_96, because div > 2^96
        const sqrtPriceLoc_96 = MulDivMath.mulDivFloor(rg.sqrtPriceR_96, Consts.Q96, div);

        ret.completeLiquidity = false;
        ret.locPt = LogPowMath.getLogSqrtPriceFloor(sqrtPriceLoc_96);

        ret.locPt = Math.max(rg.leftPt, ret.locPt);
        ret.locPt = Math.min(rg.rightPt - 1, ret.locPt);
        ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt);

        if (ret.locPt === rg.leftPt) {
            ret.acquireX = Consts.ZERO;
            ret.costY = Consts.ZERO;
            return ret;
        }

        ret.completeLiquidity = false;
        // ret.acquireX <= desireX <= uint128.max
        ret.acquireX = MaxMinMath.min(AmountMath._getAmountX(
            rg.liquidity,
            rg.leftPt,
            ret.locPt,
            ret.sqrtLoc_96,
            rg.sqrtRate_96,
            false
        ), desireX);

        ret.costY = AmountMath._getAmountY(
            rg.liquidity,
            rg.sqrtPriceL_96,
            ret.sqrtLoc_96,
            rg.sqrtRate_96,
            true
        );

        return ret
    }

    export function y2XRange(
        currentState: SwapQuery.State,
        rightPt: number,
        sqrtRate_96: JSBI,
        originDesireX: JSBI
    ) : RangeRetState {
        const retState = {} as RangeRetState
        retState.costY = Consts.ZERO;
        retState.acquireX = Consts.ZERO;
        retState.finished = false;
        let desireX = originDesireX;
        // first, if current point is not all x, we can not move right directly
        const startHasY = JSBI.lessThan(currentState.liquidityX, currentState.liquidity);
        if (startHasY) {

            const {costY, acquireX, newLiquidityX} = y2XAtPriceLiquidity(desireX, currentState.sqrtPrice_96, currentState.liquidityX);
            retState.costY = costY
            retState.acquireX = acquireX
            retState.liquidityX = newLiquidityX

            if (JSBI.notEqual(retState.liquidityX, Consts.ZERO) || JSBI.greaterThanOrEqual(retState.acquireX, desireX)) {
                // currX remain, means desire runout
                retState.finished = true;
                retState.finalPt = currentState.currentPoint;
                retState.sqrtFinalPrice_96 = currentState.sqrtPrice_96;
                return retState;
            } else {
                // not finished
                desireX = JSBI.subtract(desireX, retState.acquireX);
                currentState.currentPoint += 1;
                if (currentState.currentPoint == rightPt) {
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
        const ret = y2XRangeComplete(
            {
                liquidity: currentState.liquidity,
                sqrtPriceL_96: currentState.sqrtPrice_96,
                leftPt: currentState.currentPoint,
                sqrtPriceR_96: sqrtPriceR_96,
                rightPt: rightPt,
                sqrtRate_96: sqrtRate_96
            } as Range, 
            desireX
        );
        retState.costY = JSBI.add(retState.costY, ret.costY);
        retState.acquireX = JSBI.add(retState.acquireX, ret.acquireX);
        desireX = JSBI.subtract(desireX, ret.acquireX);

        if (ret.completeLiquidity) {
            retState.finished = JSBI.equal(desireX, Consts.ZERO);
            retState.finalPt = rightPt;
            retState.sqrtFinalPrice_96 = sqrtPriceR_96;
        } else {
            const {costY: locCostY, acquireX: locAcquireX, newLiquidityX} = y2XAtPriceLiquidity(desireX, ret.sqrtLoc_96, currentState.liquidity);
            retState.liquidityX = newLiquidityX
            retState.costY = JSBI.add(retState.costY, locCostY);
            retState.acquireX = JSBI.add(retState.acquireX, locAcquireX);
            retState.finished = true;
            retState.finalPt = ret.locPt;
            retState.sqrtFinalPrice_96 = ret.sqrtLoc_96;
        }
        return retState
    }

}