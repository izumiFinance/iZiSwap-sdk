import JSBI from "jsbi";
import { Consts } from "./consts";
import { LogPowMath } from "./LogPowMath";
import { MulDivMath } from "./MulDivMath";

export namespace AmountMath {

    export function _getAmountY(
        liquidity: JSBI,
        sqrtPriceL_96: JSBI,
        sqrtPriceR_96: JSBI,
        sqrtRate_96: JSBI,
        upper: boolean
    ): JSBI {
        const numerator = JSBI.subtract(sqrtPriceR_96, sqrtPriceL_96)
        const denominator = JSBI.subtract(sqrtRate_96, Consts.Q96)
        if (!upper) {
            return MulDivMath.mulDivFloor(liquidity, numerator, denominator)
        } else {
            return MulDivMath.mulDivCeil(liquidity, numerator, denominator)
        }
    }

    export function _getAmountX(
        liquidity: JSBI,
        leftPt: number,
        rightPt: number,
        sqrtPriceR_96: JSBI,
        sqrtRate_96: JSBI,
        upper: boolean
    ): JSBI {
        const sqrtPricePrPl_96 = LogPowMath.getSqrtPrice(rightPt - leftPt)
        const sqrtPricePrM1_96 = MulDivMath.mulDivFloor(
            sqrtPriceR_96, Consts.Q96, sqrtRate_96
        )
        const numerator = JSBI.subtract(sqrtPricePrPl_96, Consts.Q96)
        const denominator = JSBI.subtract(sqrtPriceR_96, sqrtPricePrM1_96)
        if (!upper) {
            return MulDivMath.mulDivFloor(liquidity, numerator, denominator)
        } else {
            return MulDivMath.mulDivCeil(liquidity, numerator, denominator)
        }
    }

}