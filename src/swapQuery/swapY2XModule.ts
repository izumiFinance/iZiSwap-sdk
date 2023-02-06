import JSBI from "jsbi";
import invariant from "tiny-invariant";
import { iZiSwapPool } from "./iZiSwapPool";
import { Consts } from "./library/consts";
import { LogPowMath } from "./library/LogPowMath";
import { MulDivMath } from "./library/MulDivMath";
import { Orders } from "./library/Orders";
import { SwapMathY2X } from "./library/SwapMathY2X";
import { SwapMathY2XDesire } from "./library/SwapMathY2XDesire";

export namespace SwapY2XModule {
    
    export function swapY2X(pool: iZiSwapPool, amount: JSBI, highPt: number): {amountX: JSBI, amountY: JSBI} {
        invariant(JSBI.greaterThan(amount, Consts.ZERO), "AP")
        highPt = Math.min(highPt, pool.rightMostPt)
        invariant(Orders.coverHighPoint(pool.orders, highPt), 'order data donot cover low point')
        let amountX = Consts.ZERO
        let amountY = Consts.ZERO
        const st = pool.state
        let finished = false
        const sqrtRate_96 = pool.sqrtRate_96
        const pointDelta = pool.pointDelta
        let currentCursor = Orders.findRightCursor(pool.orders, st.currentPoint)
        const fee = JSBI.BigInt(pool.fee)
        const feeRemain = JSBI.BigInt(1e6 - pool.fee)

        let count = 0

        while (st.currentPoint < highPt && !finished) {
            count += 1
            if (currentCursor.isLimitOrderPoint) {
                const amountNoFee = MulDivMath.mulDivFloor(amount, feeRemain, Consts.ONE_M)
                if (JSBI.greaterThan(amountNoFee, Consts.ZERO)) {
                    const currX = pool.orders.sellingX[currentCursor.sellingIdx]
                    const {costY, acquireX} = SwapMathY2X.y2XAtPrice(
                        amountNoFee, st.sqrtPrice_96, currX
                    )
                    if (JSBI.lessThan(acquireX, currX) || JSBI.greaterThanOrEqual(costY, amountNoFee)) {
                        finished = true
                    }
                    let feeAmount = Consts.ZERO
                    if (JSBI.greaterThanOrEqual(costY, amountNoFee)) {
                        feeAmount = JSBI.subtract(amount, costY)
                    } else {
                        feeAmount = MulDivMath.mulDivCeil(costY, fee, feeRemain)
                    }
                    const cost = JSBI.add(costY, feeAmount)
                    amount = JSBI.subtract(amount, cost)
                    amountY = JSBI.add(amountY, cost)
                    amountX = JSBI.add(amountX, acquireX)
                } else {
                    finished = true
                }
            }
            if (finished) {
                break
            }
            const nextPoint = Math.min(
                Orders.nearestRightOneOrBoundary(
                    pool.orders, currentCursor, st.currentPoint, pointDelta
                ), highPt
            )
            if (JSBI.equal(st.liquidity, Consts.ZERO)) {
                st.currentPoint = nextPoint
                st.sqrtPrice_96 = LogPowMath.getSqrtPrice(st.currentPoint)
                currentCursor = Orders.findRightFromCursor(pool.orders, currentCursor, st.currentPoint)
                st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
                st.liquidityX = st.liquidity
            } else {
                const amountNoFee = MulDivMath.mulDivFloor(amount, feeRemain, Consts.ONE_M)
                if (JSBI.greaterThan(amountNoFee, Consts.ZERO)) {
                    const retState = SwapMathY2X.y2XRange(
                        st, nextPoint, sqrtRate_96, amountNoFee
                    )
                    finished = retState.finished
    
                    let feeAmount = Consts.ZERO
                    if (JSBI.greaterThanOrEqual(retState.costY, amountNoFee)) {
                        feeAmount = JSBI.subtract(amount, retState.costY)
                    } else {
                        feeAmount = MulDivMath.mulDivCeil(retState.costY, fee, feeRemain)
                    }
    
                    const cost = JSBI.add(retState.costY, feeAmount)
                    amountX = JSBI.add(amountX, retState.acquireX)
                    amountY = JSBI.add(amountY, cost)
    
                    amount = JSBI.subtract(amount, cost)
    
                    st.currentPoint = retState.finalPt
                    st.sqrtPrice_96 = retState.sqrtFinalPrice_96
                    st.liquidityX = retState.liquidityX
                } else {
                    finished = true
                }
                if (st.currentPoint === nextPoint) {
                    currentCursor = Orders.findRightFromCursor(pool.orders, currentCursor, st.currentPoint)
                    st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
                    st.liquidityX = st.liquidity
                } else {
                    // not necessary, because retState.finished must be true
                    finished = true
                }
            }
        }

        return {amountX, amountY}
    }


    export function swapY2XDesireX(pool: iZiSwapPool, desireX: JSBI, highPt: number): {amountX: JSBI, amountY: JSBI} {
        invariant(JSBI.greaterThan(desireX, Consts.ZERO), "AP")
        highPt = Math.min(highPt, pool.rightMostPt)
        invariant(Orders.coverHighPoint(pool.orders, highPt), 'order data donot cover low point')
        let amountX = Consts.ZERO
        let amountY = Consts.ZERO
        const st = pool.state
        let finished = false
        const sqrtRate_96 = pool.sqrtRate_96
        const pointDelta = pool.pointDelta
        let currentCursor = Orders.findRightCursor(pool.orders, st.currentPoint)
        const fee = JSBI.BigInt(pool.fee)
        const feeRemain = JSBI.BigInt(1e6 - pool.fee)

        while (st.currentPoint < highPt && !finished) {
            if (currentCursor.isLimitOrderPoint) {
                const currX = pool.orders.sellingX[currentCursor.sellingIdx]
                const {costY, acquireX} = SwapMathY2XDesire.y2XAtPrice(
                    desireX, st.sqrtPrice_96, currX
                )
                if (JSBI.greaterThanOrEqual(acquireX, desireX)) {
                    finished = true
                }
                const feeAmount = MulDivMath.mulDivCeil(costY, fee, feeRemain)
                const cost = JSBI.add(costY, feeAmount)
                desireX = JSBI.subtract(desireX, acquireX)
                amountY = JSBI.add(amountY, cost)
                amountX = JSBI.add(amountX, acquireX)
            }
            if (finished) {
                break
            }
            const nextPoint = Math.min(
                Orders.nearestRightOneOrBoundary(
                    pool.orders, currentCursor, st.currentPoint, pointDelta
                ), highPt
            )
            if (JSBI.equal(st.liquidity, Consts.ZERO)) {
                st.currentPoint = nextPoint
                st.sqrtPrice_96 = LogPowMath.getSqrtPrice(st.currentPoint)
                currentCursor = Orders.findRightFromCursor(pool.orders, currentCursor, st.currentPoint)
                st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
                st.liquidityX = st.liquidity
            } else {
                const retState = SwapMathY2XDesire.y2XRange(
                    st, nextPoint, sqrtRate_96, desireX
                )
                finished = retState.finished

                const feeAmount = MulDivMath.mulDivCeil(retState.costY, fee, feeRemain)

                const cost = JSBI.add(retState.costY, feeAmount)
                amountX = JSBI.add(amountX, retState.acquireX)
                amountY = JSBI.add(amountY, cost)

                desireX = JSBI.subtract(desireX, retState.acquireX)

                st.currentPoint = retState.finalPt
                st.sqrtPrice_96 = retState.sqrtFinalPrice_96
                st.liquidityX = retState.liquidityX

                if (st.currentPoint === nextPoint) {
                    currentCursor = Orders.findRightFromCursor(pool.orders, currentCursor, st.currentPoint)
                    st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
                    st.liquidityX = st.liquidity
                } else {
                    // not necessary, because retState.finished must be true
                    finished = true
                }
            }
        }
        return {amountX, amountY}
    }

}