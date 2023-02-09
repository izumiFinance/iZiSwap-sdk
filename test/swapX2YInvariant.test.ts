import JSBI from "jsbi";
import { iZiSwapPool } from "../src/swapQuery/iZiSwapPool";
import { LogPowMath } from "../src/swapQuery/library/LogPowMath";
import { Orders } from "../src/swapQuery/library/Orders";
import { SwapQuery } from "../src/swapQuery/library/State";
import { SwapX2YModule } from '../src/swapQuery/swapX2YModule'
import { SwapQueryErrCode, SwapQueryError } from "../src/swapQuery/error";
import { Consts } from "../src/swapQuery/library/consts";
interface DataPair {
    point: number,
    data: JSBI
}

function getDataPair(point: number, data: number | string | JSBI): DataPair {
    return {point, data: JSBI.BigInt(data)}
}

describe("test swapX2Y", ()=>{
    test('test swapX2Y order not cover currentPt or lowPt', () => {
        const liquidityData = [
            getDataPair(-3600, 100000),
            getDataPair(3600, 0)
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('100000')
        const currentPoint = 3600

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
            SwapX2YModule.swapX2Y(pool, JSBI.BigInt('1000000000000000'), -3600)
        } catch (err: any) {
            expect(false).toBe(true)
        }

        try {
            SwapX2YModule.swapX2Y(pool, JSBI.BigInt('1000000000000000'), -3601)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.LOWPT_OVER_ORDER_RANGE_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

        orders.liquidity.pop()
        orders.liquidityDeltaPoint.pop()

        try {
            SwapX2YModule.swapX2Y(pool, JSBI.BigInt('1000000000000000'), -3599)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.CURRENTPT_OVER_ORDER_RANGE_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

    });

    test('test swapX2Y if currentPt < lowPt ', () => {
        const liquidityData = [
            getDataPair(-3600, 100000),
            getDataPair(3600, 0)
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('100000')
        const currentPoint = 3001

        const sellingXData = [
            getDataPair(3680, '1000000000000'),
        ]
        const sellingYData = [
            getDataPair(-3600, '2000000000000')
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

        SwapX2YModule.swapX2Y(pool, JSBI.BigInt('1000000000000000'), currentPoint)
        SwapX2YModule.swapX2Y(pool, JSBI.BigInt('1000000000000000'), currentPoint - 1)

        try {
            SwapX2YModule.swapX2Y(pool, JSBI.BigInt('1000000000000000'), currentPoint + 1)
            expect(false).toBe(true)
        } catch (err: any) {
            if (err instanceof SwapQueryError) {
                expect(err.code).toBe(SwapQueryErrCode.LOWPT_GREATER_THAN_CURRENTPT_ERROR)
            } else {
                expect(false).toBe(true)
            }
        }

    });
})