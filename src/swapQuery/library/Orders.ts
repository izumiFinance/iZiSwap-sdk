import JSBI from "jsbi";
import { BinarySearch } from "./BinarySearch";
import { Consts } from "./consts";

export namespace Orders {

    export interface Orders {

        liquidity: JSBI[]
        liquidityDeltaPoint: number[]

        sellingX: JSBI[]
        sellingXPoint: number[]

        sellingY: JSBI[]
        sellingYPoint: number[]

    }

    export interface Cursor {
        liquidityIdx: number
        sellingIdx: number
        currentPoint: number
        isLiquidityPoint: boolean
        isLimitOrderPoint: boolean
    }

    export function findLeftCursor(
        orders: Orders,
        currentPoint: number
    ): Cursor {
        const liquidityIdx = BinarySearch.findLeft(orders.liquidityDeltaPoint, currentPoint, BinarySearch.FindLeftOperator.LESS_THAN_OR_EQUAL)
        const sellingIdx = BinarySearch.findLeft(orders.sellingYPoint, currentPoint, BinarySearch.FindLeftOperator.LESS_THAN_OR_EQUAL)
        const isLiquidityPoint = (liquidityIdx >= 0) && (orders.liquidityDeltaPoint[liquidityIdx] === currentPoint)
        const isLimitOrderPoint = (sellingIdx >= 0) && (orders.sellingYPoint[sellingIdx] === currentPoint)
        return {liquidityIdx, sellingIdx, currentPoint, isLimitOrderPoint, isLiquidityPoint}
    }

    export function findRightCursor(
        orders: Orders,
        currentPoint: number
    ): Cursor {
        const liquidityIdx = BinarySearch.findLeft(orders.liquidityDeltaPoint, currentPoint, BinarySearch.FindLeftOperator.LESS_THAN_OR_EQUAL)
        const sellingIdx = BinarySearch.findRight(orders.sellingXPoint, currentPoint, BinarySearch.FindRightOperator.GREATER_THAN_OR_EQUAL)
        const liquidityLength = orders.liquidityDeltaPoint.length
        const isLiquidityPoint = (liquidityIdx < liquidityLength) && (orders.liquidityDeltaPoint[liquidityIdx] === currentPoint)
        const sellingLength = orders.sellingXPoint.length
        const isLimitOrderPoint = (sellingIdx < sellingLength) && (orders.sellingXPoint[sellingIdx] === currentPoint)
        return {liquidityIdx, sellingIdx, currentPoint, isLimitOrderPoint, isLiquidityPoint}
    }

    export function findLeftFromCursor(
        orders: Orders,
        currentCursor: Cursor,
        currentPoint: number
    ): Cursor {
        let liquidityIdx = currentCursor.liquidityIdx
        while (liquidityIdx >= 0 && orders.liquidityDeltaPoint[liquidityIdx] > currentPoint) {
            --liquidityIdx
        }
        let sellingIdx = currentCursor.sellingIdx
        while (sellingIdx >= 0 && orders.sellingYPoint[sellingIdx] > currentPoint) {
            --sellingIdx
        }
        const isLiquidityPoint = (liquidityIdx >= 0) && (orders.liquidityDeltaPoint[liquidityIdx] === currentPoint)
        const isLimitOrderPoint = (sellingIdx >= 0) && (orders.sellingYPoint[sellingIdx] === currentPoint)
        return {liquidityIdx, sellingIdx, currentPoint, isLimitOrderPoint, isLiquidityPoint}
    }

    export function findRightFromCursor(
        orders: Orders,
        currentCursor: Cursor,
        currentPoint: number
    ): Cursor {
        let liquidityIdx = currentCursor.liquidityIdx
        const liquidityLength = orders.liquidity.length
        while (liquidityIdx < liquidityLength && orders.liquidityDeltaPoint[liquidityIdx] <= currentPoint) {
            ++ liquidityIdx
        }
        liquidityIdx --
        let sellingIdx = currentCursor.sellingIdx
        const sellingLength = orders.sellingX.length
        while (sellingIdx < sellingLength && orders.sellingXPoint[sellingIdx] < currentPoint) {
            ++ sellingIdx
        }
        const isLiquidityPoint = (liquidityIdx >= 0) && (orders.liquidityDeltaPoint[liquidityIdx] === currentPoint)
        const isLimitOrderPoint = (sellingIdx < sellingLength) && (orders.sellingXPoint[sellingIdx] === currentPoint)
        return {liquidityIdx, sellingIdx, currentPoint, isLimitOrderPoint, isLiquidityPoint}
    }

    export function coverLowPoint(orders: Orders, lowPt: number): boolean {
        return (orders.liquidityDeltaPoint[0] <= lowPt && orders.sellingYPoint[0] <= lowPt)
    }

    export function coverHighPoint(orders: Orders, highPt: number): boolean {
        const liquidityNum = orders.liquidityDeltaPoint.length
        const sellingNum = orders.sellingXPoint.length
        return (highPt <= orders.liquidityDeltaPoint[liquidityNum - 1] && highPt <= orders.sellingXPoint[sellingNum - 1])
    }

    export function nearestLeftOneOrBoundary(
        orders: Orders,
        currentCursor: Cursor,
        point: number,
        pointDelta: number
    ) : number {
        const liquidityPoint = currentCursor.liquidityIdx >= 0 ? orders.liquidityDeltaPoint[currentCursor.liquidityIdx] : Consts.LEFT_MOST_PT
        const sellingPoint = currentCursor.sellingIdx >= 0 ? orders.sellingYPoint[currentCursor.sellingIdx] : Consts.LEFT_MOST_PT
        const nextPoint = Math.max(liquidityPoint, sellingPoint)
        let mapPt = Math.floor(point / pointDelta)
    
        const bitIdx = (mapPt % 256 + 256) % 256
        const leftPtInBlock = (mapPt - bitIdx) * pointDelta
        return Math.max(nextPoint, leftPtInBlock)
    }

    export function nearestRightOneOrBoundary(
        orders: Orders,
        currentCursor: Cursor,
        point: number,
        pointDelta: number
    ) : number {
        const liquidityLength = orders.liquidity.length
        const destLiquidityIdx = currentCursor.liquidityIdx + 1
        const liquidityPoint = destLiquidityIdx < liquidityLength ? orders.liquidityDeltaPoint[destLiquidityIdx] : Consts.RIGHT_MOST_PT
        const destSellingIdx = currentCursor.isLimitOrderPoint ? currentCursor.sellingIdx + 1 : currentCursor.sellingIdx
        const sellingPoint = destSellingIdx < orders.sellingX.length ? orders.sellingXPoint[destSellingIdx] : Consts.RIGHT_MOST_PT
        const nextPoint = Math.min(liquidityPoint, sellingPoint)
        let mapPt = Math.floor(point / pointDelta)
        // strict right of current point
        mapPt += 1
        const bitIdx = (mapPt % 256 + 256) % 256
        const rightPtInBlock = (mapPt + 255 - bitIdx) * pointDelta
        return Math.min(nextPoint, rightPtInBlock)
    }

    
}