import JSBI from "jsbi";
import invariant from "tiny-invariant";
import { Consts } from "./library/consts";
import { iZiSwapPool } from "./iZiSwapPool";
import { Orders } from "./library/Orders";
import { MulDivMath } from "./library/MulDivMath";
import { SwapMathX2Y } from "./library/SwapMathX2Y";
import { LogPowMath } from "./library/LogPowMath";
import { SwapMathX2YDesire } from "./library/SwapMathX2YDesire";
export namespace SwapX2YModule {

    export function swapX2Y(pool: iZiSwapPool, amount: JSBI, lowPt: number): {amountX: JSBI, amountY: JSBI} {
        invariant(JSBI.greaterThan(amount, Consts.ZERO), "AP")        
        lowPt = Math.max(lowPt, pool.leftMostPt)
        invariant(Orders.coverLowPoint(pool.orders, lowPt), "order data donot cover low point")
        let amountX = Consts.ZERO
        let amountY = Consts.ZERO
        const st = pool.state
        // const currFeeScaleX_128 = st.feeScaleX_128
        // const currFeeScaleY_128 = st.feeScaleY_128
        let finished = false
        const sqrtRate_96 = pool.sqrtRate_96
        // console.log('sqrt rate')
        const pointDelta = pool.pointDelta
        let currentCursor = Orders.findLeftCursor(pool.orders, st.currentPoint)

        const fee = JSBI.BigInt(pool.fee)
        const feeRemain = JSBI.BigInt(1e6 - pool.fee)

        while (lowPt <= st.currentPoint && !finished) {
            // clear limit order first
            if (currentCursor.isLimitOrderPoint) {
                const amountNoFee = MulDivMath.mulDivFloor(amount, feeRemain, Consts.ONE_M)
                if (JSBI.greaterThan(amountNoFee, Consts.ZERO)) {
                    const currY = pool.orders.sellingY[currentCursor.sellingIdx]
                    const {costX, acquireY} = SwapMathX2Y.x2YAtPrice(
                        amountNoFee, st.sqrtPrice_96, currY
                    )
                    if (JSBI.lessThan(acquireY, currY) || JSBI.greaterThanOrEqual(costX, amountNoFee)) {
                        finished = true
                    }
                    let feeAmount = Consts.ZERO
                    if (JSBI.greaterThanOrEqual(costX, amountNoFee)) {
                        feeAmount = JSBI.subtract(amount, costX)
                    } else {
                        feeAmount = MulDivMath.mulDivCeil(costX, fee, feeRemain)
                    }
                    const cost = JSBI.add(costX, feeAmount)
                    amount = JSBI.subtract(amount,cost)
                    amountX = JSBI.add(amountX, cost)
                    amountY = JSBI.add(amountY, acquireY)
                } else {
                    finished = true
                }
            }
            if (finished) {
                break
            }
            const searchStart = st.currentPoint - 1
            if (currentCursor.isLiquidityPoint) {
                const amountNoFee = MulDivMath.mulDivFloor(amount, feeRemain, Consts.ONE_M)
                if (JSBI.greaterThan(amountNoFee, Consts.ZERO)) {
                    if (JSBI.greaterThan(st.liquidity, Consts.ZERO)) {
                        const retState = SwapMathX2Y.x2YRange(
                            st, st.currentPoint, sqrtRate_96, amountNoFee
                        )
                        finished = retState.finished
                        let feeAmount = Consts.ZERO
                        if (JSBI.greaterThanOrEqual(retState.costX, amountNoFee)) {
                            feeAmount = JSBI.subtract(amount, retState.costX)
                        } else {
                            feeAmount = MulDivMath.mulDivCeil(retState.costX, fee, feeRemain)
                        }
                        const cost = JSBI.add(retState.costX, feeAmount)
                        amountX = JSBI.add(amountX, cost)
                        amountY = JSBI.add(amountY, retState.acquireY)
                        amount = JSBI.subtract(amount, cost)
                        st.currentPoint = retState.finalPt
                        st.sqrtPrice_96 = retState.sqrtFinalPrice_96
                        st.liquidityX = retState.liquidityX
                    }
                    if (!finished) {
                        st.currentPoint --
                        if (st.currentPoint < lowPt) {
                            break
                        }
                        st.sqrtPrice_96 = LogPowMath.getSqrtPrice(st.currentPoint)
                        currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, st.currentPoint)
                        st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
                        st.liquidityX = Consts.ZERO
                    }
                }
            }
            if (finished || st.currentPoint < lowPt) {
                break
            }
            currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, searchStart)
            const nextPt = Math.max(lowPt, Orders.nearestLeftOneOrBoundary(pool.orders, currentCursor, searchStart, pointDelta))
            if (JSBI.equal(st.liquidity, Consts.ZERO)) {
                st.currentPoint = nextPt
                st.sqrtPrice_96 = LogPowMath.getSqrtPrice(st.currentPoint)
                currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, st.currentPoint)
            } else {
                const amountNoFee = MulDivMath.mulDivFloor(
                    amount, feeRemain, Consts.ONE_M
                )
                if (JSBI.greaterThan(amountNoFee, Consts.ZERO)) {
                    const retState = SwapMathX2Y.x2YRange(
                        st, nextPt, sqrtRate_96, amountNoFee
                    )
                    finished = retState.finished
                    let feeAmount = Consts.ZERO
                    if (JSBI.greaterThanOrEqual(retState.costX, amountNoFee)) {
                        feeAmount = JSBI.subtract(amount, retState.costX)
                    } else {
                        feeAmount = MulDivMath.mulDivCeil(retState.costX, fee, feeRemain)
                    }
                    amountY = JSBI.add(amountY, retState.acquireY)
                    const cost = JSBI.add(retState.costX, feeAmount)
                    amountX = JSBI.add(amountX, cost)
                    amount = JSBI.subtract(amount, cost)
                    st.currentPoint = retState.finalPt
                    st.sqrtPrice_96 = retState.sqrtFinalPrice_96
                    st.liquidityX = retState.liquidityX
                } else {
                    finished = true
                }
                currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, st.currentPoint)
                st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
            }
            if (st.currentPoint <= lowPt) {
                break
            }
        }
        return {amountX, amountY}
    }


    export function swapX2YDesireY(pool: iZiSwapPool, desireY: JSBI, lowPt: number): {amountX: JSBI, amountY: JSBI} {
        invariant(JSBI.greaterThan(desireY, Consts.ZERO), "AP")
        lowPt = Math.max(lowPt, pool.leftMostPt)
        invariant(Orders.coverLowPoint(pool.orders, lowPt), "order data donot cover low point")
        let amountX = Consts.ZERO
        let amountY = Consts.ZERO
        const st = pool.state
        // const currFeeScaleX_128 = st.feeScaleX_128
        // const currFeeScaleY_128 = st.feeScaleY_128
        let finished = false
        const sqrtRate_96 = pool.sqrtRate_96
        const pointDelta = pool.pointDelta
        let currentCursor = Orders.findLeftCursor(pool.orders, st.currentPoint)

        const fee = JSBI.BigInt(pool.fee)
        const feeRemain = JSBI.BigInt(1e6 - pool.fee)

        while (lowPt <= st.currentPoint && !finished) {
            // clear limit order first
            if (currentCursor.isLimitOrderPoint) {
                const currY = pool.orders.sellingY[currentCursor.sellingIdx]
                const {costX, acquireY} = SwapMathX2YDesire.x2YAtPrice(
                    desireY, st.sqrtPrice_96, currY
                )
                if (JSBI.greaterThanOrEqual(acquireY, desireY)) {
                    finished = true
                }
                const feeAmount = MulDivMath.mulDivCeil(costX, fee, feeRemain)
                const cost = JSBI.add(costX, feeAmount)
                desireY = JSBI.subtract(desireY, acquireY)
                amountX = JSBI.add(amountX, cost)
                amountY = JSBI.add(amountY, acquireY)
            }
            if (finished) {
                break
            }
            const searchStart = st.currentPoint - 1
            if (currentCursor.isLiquidityPoint) {
                if (JSBI.greaterThan(st.liquidity, Consts.ZERO)) {
                    const retState = SwapMathX2YDesire.x2YRange(
                        st, st.currentPoint, sqrtRate_96, desireY
                    )
                    finished = retState.finished
                    const feeAmount = MulDivMath.mulDivCeil(retState.costX, fee, feeRemain)
                    const cost = JSBI.add(retState.costX, feeAmount)
                    amountX = JSBI.add(amountX, cost)
                    amountY = JSBI.add(amountY, retState.acquireY)
                    desireY = JSBI.subtract(desireY, retState.acquireY)
                    st.currentPoint = retState.finalPt
                    st.sqrtPrice_96 = retState.sqrtFinalPrice_96
                    st.liquidityX = retState.liquidityX
                }
                if (!finished) {
                    st.currentPoint --
                    if (st.currentPoint < lowPt) {
                        break
                    }
                    st.sqrtPrice_96 = LogPowMath.getSqrtPrice(st.currentPoint)
                    currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, st.currentPoint)
                    st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
                    st.liquidityX = Consts.ZERO
                }
            }
            if (finished || st.currentPoint < lowPt) {
                break
            }
            currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, searchStart)
            const nextPt = Math.max(lowPt, Orders.nearestLeftOneOrBoundary(pool.orders, currentCursor, searchStart, pointDelta))
            if (JSBI.equal(st.liquidity, Consts.ZERO)) {
                st.currentPoint = nextPt
                st.sqrtPrice_96 = LogPowMath.getSqrtPrice(st.currentPoint)
                currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, st.currentPoint)
            } else {
                const retState = SwapMathX2YDesire.x2YRange(
                    st, nextPt, sqrtRate_96, desireY
                )
                finished = retState.finished
                const feeAmount = MulDivMath.mulDivCeil(retState.costX, fee, feeRemain)
                amountY = JSBI.add(amountY, retState.acquireY)
                const cost = JSBI.add(retState.costX, feeAmount)
                amountX = JSBI.add(amountX, cost)
                desireY = JSBI.subtract(desireY, retState.acquireY)
                st.currentPoint = retState.finalPt
                st.sqrtPrice_96 = retState.sqrtFinalPrice_96
                st.liquidityX = retState.liquidityX
                currentCursor = Orders.findLeftFromCursor(pool.orders, currentCursor, st.currentPoint)
                st.liquidity = pool.orders.liquidity[currentCursor.liquidityIdx]
            }
            if (st.currentPoint <= lowPt) {
                break
            }
        }
        return {amountX, amountY}
    }


}