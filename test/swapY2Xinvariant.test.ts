import JSBI from "jsbi";
import { iZiSwapPool } from "../src/swapQuery/iZiSwapPool";
import { LogPowMath } from "../src/swapQuery/library/LogPowMath";
import { Orders } from "../src/swapQuery/library/Orders";
import { SwapQuery } from "../src/swapQuery/library/State";
import { SwapY2XModule } from '../src/swapQuery/swapY2XModule'
import { SwapQueryErrCode, SwapQueryError } from "../src/swapQuery/error";
import { Consts } from "../src/swapQuery/library/consts";
interface DataPair {
    point: number,
    data: JSBI
}

function getDataPair(point: number, data: number | string | JSBI): DataPair {
    return {point, data: JSBI.BigInt(data)}
}

describe("test swapY2X", ()=>{
    test('test swapY2X order not cover currentPt or highPt', () => {
        const liquidityData = [
            getDataPair(-3600, 100000),
            getDataPair(3600, 0)
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('100000')
        const currentPoint = -3601

        const sellingXData = [
            getDataPair(-3680, '1000000000000'),
            getDataPair(0, '2000000000000')
        ]
        const sellingYData = [
            getDataPair(-5000, '2000000000000')
        ]

        const highPoint = 3566

        const orders: Orders.Orders = {
            liquidityDeltaPoint: liquidityData.map((e: DataPair)=>e.point),
            liquidity: liquidityData.map((e: DataPair)=>e.data),
            sellingX: sellingXData.map((e: DataPair)=>e.data),
            sellingXPoint: sellingXData.map((e: DataPair)=>e.point),
            sellingY: sellingYData.map((e: DataPair)=>e.data),
            sellingYPoint: sellingYData.map((e: DataPair)=>e.point)
        }
        const state: SwapQuery.State = {
            currentPoint,
            sqrtPrice_96: LogPowMath.getSqrtPrice(currentPoint),
            liquidity,
            liquidityX
        }
        const sqrtRate_96 = LogPowMath.getSqrtPrice(1)
        const pointDelta = 40
        let pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        try {
            SwapY2XModule.swapY2X(pool, JSBI.BigInt('1000000000000000'), highPoint)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.HIGHPT_OVER_ORDER_RANGE_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

        orders.sellingX.push(JSBI.BigInt('0'))
        orders.sellingXPoint.push(Consts.RIGHT_MOST_PT)

        try {
            SwapY2XModule.swapY2X(pool, JSBI.BigInt('1000000000000000'), highPoint)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.CURRENTPT_OVER_ORDER_RANGE_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

    });

    test('test swapY2X if currentPt >= highPt ', () => {
        const liquidityData = [
            getDataPair(-3600, 100000),
            getDataPair(3600, 0)
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('100000')
        const currentPoint = -100

        const sellingXData = [
            getDataPair(-3680, '1000000000000'),
            getDataPair(0, '2000000000000')
        ]
        const sellingYData = [
            getDataPair(-5000, '2000000000000')
        ]

        const orders: Orders.Orders = {
            liquidityDeltaPoint: liquidityData.map((e: DataPair)=>e.point),
            liquidity: liquidityData.map((e: DataPair)=>e.data),
            sellingX: sellingXData.map((e: DataPair)=>e.data),
            sellingXPoint: sellingXData.map((e: DataPair)=>e.point),
            sellingY: sellingYData.map((e: DataPair)=>e.data),
            sellingYPoint: sellingYData.map((e: DataPair)=>e.point)
        }
        const state: SwapQuery.State = {
            currentPoint,
            sqrtPrice_96: LogPowMath.getSqrtPrice(currentPoint),
            liquidity,
            liquidityX
        }
        const sqrtRate_96 = LogPowMath.getSqrtPrice(1)
        const pointDelta = 40
        let pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        try {
            SwapY2XModule.swapY2X(pool, JSBI.BigInt('1000000000000000'), currentPoint)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.HIGHPT_NOT_GREATER_THAN_CURRENTPT_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

        try {
            SwapY2XModule.swapY2X(pool, JSBI.BigInt('1000000000000000'), currentPoint - 1)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.HIGHPT_NOT_GREATER_THAN_CURRENTPT_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

    });
})