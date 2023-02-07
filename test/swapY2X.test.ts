import JSBI from "jsbi";
import { iZiSwapPool } from "../src/swapQuery/iZiSwapPool";
import { LogPowMath } from "../src/swapQuery/library/LogPowMath";
import { Orders } from "../src/swapQuery/library/Orders";
import { SwapQuery } from "../src/swapQuery/library/State";
import { calc } from './funcs'
import { SwapY2XModule } from '../src/swapQuery/swapY2XModule'
interface DataPair {
    point: number,
    data: JSBI
}

function getDataPair(point: number, data: number | string | JSBI): DataPair {
    return {point, data: JSBI.BigInt(data)}
}

describe("test swapY2X", ()=>{
    test('test swapY2X liquidity and limit order long range, end with partial liquidity', () => {
        const liquidityData = [
            getDataPair(-4000, 100000),
            // -2800
            getDataPair(-2800, 200000),
            getDataPair(-2000, 100000),
            // -1600
            getDataPair(-1000, 200000),
            // -200
            // 720
            getDataPair(1200, 0),
            // 1800
            // 1840
            // 1880
            getDataPair(2200, 300000),
            // 2800
            // 3000
            getDataPair(3600, 200000)
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('100000')
        const currentPoint = -2911

        const costYInRange = [
            JSBI.add(
                calc.l2Y(JSBI.BigInt('20000'), LogPowMath.getSqrtPrice(currentPoint), true),
                calc.yInRange('100000', currentPoint + 1, -2800, 1.0001, true),
            ),
            calc.yInRange('200000', -2800, -2000, 1.0001, true),
            calc.yInRange('100000', -2000, -1600, 1.0001, true),
            calc.yInRange('100000', -1600, -1000, 1.0001, true),
            calc.yInRange('200000', -1000, -200, 1.0001, true),
            calc.yInRange('200000', -200, -40, 1.0001, true),
            calc.yInRange('200000', -40, 720, 1.0001, true),
            calc.yInRange('200000', 720, 1200, 1.0001, true),
            calc.yInRange('300000', 2200, 2800, 1.0001, true),
            calc.yInRange('300000', 2800, 3000, 1.0001, true),
            JSBI.add(
                calc.yInRange('300000', 3000, 3512, 1.0001, true),
                calc.l2Y(JSBI.BigInt('120000'), LogPowMath.getSqrtPrice(3512), true)
            )
        ]
        
        const acquireXInRange = [
            JSBI.add(
                calc.l2X(JSBI.BigInt('20000'), LogPowMath.getSqrtPrice(currentPoint), false),
                calc.xInRange('100000', currentPoint + 1, -2800, 1.0001, false),
            ),
            calc.xInRange('200000', -2800, -2000, 1.0001, false),
            calc.xInRange('100000', -2000, -1600, 1.0001, false),
            calc.xInRange('100000', -1600, -1000, 1.0001, false),
            calc.xInRange('200000', -1000, -200, 1.0001, false),
            calc.xInRange('200000', -200, -40, 1.0001, false),
            calc.xInRange('200000', -40, 720, 1.0001, false),
            calc.xInRange('200000', 720, 1200, 1.0001, false),
            calc.xInRange('300000', 2200, 2800, 1.0001, false),
            calc.xInRange('300000', 2800, 3000, 1.0001, false),
            JSBI.add(
                calc.xInRange('300000', 3000, 3512, 1.0001, false),
                calc.l2X(JSBI.BigInt('120000'), LogPowMath.getSqrtPrice(3512), false)
            )
        ]


        const sellingYData = [
            getDataPair(-3600, '1000000000000'),
            getDataPair(-2911, '2000000000000')
        ]
        const sellingXData = [
            getDataPair(-2800, '1000000000000'),
            getDataPair(-1600, '2000000000000'),
            getDataPair(-200, '1000000000000'),
            getDataPair(720, '2000000000000'),
            getDataPair(1800, '1000000000000'),
            getDataPair(1840, '2000000000000'),
            getDataPair(1880, '2000000000000'),
            getDataPair(2800, '1000000000000'),
            getDataPair(3000, '2000000000000'),
            getDataPair(3600, '1000000000000'),
        ]

        const highPoint = 3600

        const acquireXAtM2800 = sellingXData[0].data
        const acquireXAtM1600 = sellingXData[1].data
        const acquireXAtM200 = sellingXData[2].data
        const acquireXAt720 = sellingXData[3].data
        const acquireXAt1800 = sellingXData[4].data
        const acquireXAt1840 = sellingXData[5].data
        const acquireXAt1880 = sellingXData[6].data
        const acquireXAt2800 = sellingXData[7].data
        const acquireXAt3000 = sellingXData[8].data

        const costYAtM2800 = calc.getCostYFromXAtPoint(-2800, acquireXAtM2800)
        const costYAtM1600 = calc.getCostYFromXAtPoint(-1600, acquireXAtM1600)
        const costYAtM200 = calc.getCostYFromXAtPoint(-200, acquireXAtM200)
        const costYAt720 = calc.getCostYFromXAtPoint(720, acquireXAt720)
        const costYAt1800 = calc.getCostYFromXAtPoint(1800, acquireXAt1800)
        const costYAt1840 = calc.getCostYFromXAtPoint(1840, acquireXAt1840)
        const costYAt1880 = calc.getCostYFromXAtPoint(1880, acquireXAt1880)
        const costYAt2800 = calc.getCostYFromXAtPoint(2800, acquireXAt2800)
        const costYAt3000 = calc.getCostYFromXAtPoint(3000, acquireXAt3000)

        const acquireX = [...acquireXInRange, 
            acquireXAtM2800, 
            acquireXAtM1600, 
            acquireXAtM200, 
            acquireXAt720,
            acquireXAt1800,
            acquireXAt1840,
            acquireXAt1880,
            acquireXAt2800,
            acquireXAt3000
        ]

        const costY = [...costYInRange,
            costYAtM2800,
            costYAtM1600,
            costYAtM200,
            costYAt720,
            costYAt1800,
            costYAt1840,
            costYAt1880,
            costYAt2800,
            costYAt3000
        ]

        const totalAcquireX = calc.getSum(acquireX)
        const totalCostY = calc.amountListAddFee(costY, JSBI.BigInt(2000))

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
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        const {amountX, amountY} = SwapY2XModule.swapY2X(pool, totalCostY, highPoint)

        expect(amountX.toString()).toBe(totalAcquireX.toString())
        expect(amountY.toString()).toBe(totalCostY.toString())

    });

    test('test swapY2X liquidity and limit order, end with partial limit order', () => {
        const liquidityData = [
            getDataPair(1000, 200000),
            // 2400
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('200000')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2000

        const costYInRange = [
            calc.yInRange('200000', 2000, 2400, 1.0001, true),
        ]
        
        const acquireXInRange = [
            calc.xInRange('200000', 2000, 2400, 1.0001, false),
        ]

        const sellingYData = [] as DataPair[]
        const sellingXData = [
            getDataPair(2400, '1000000000000'),
            getDataPair(4000, '0')
        ]

        const highPoint = 3600

        const desireXAtM2400 = JSBI.divide(sellingXData[0].data, JSBI.BigInt(11))
        const costYAtM2400 = calc.getCostYFromXAtPoint(2400, desireXAtM2400)
        const acquireXAtM2400 = calc.getEarnXFromYAtPoint(2400, costYAtM2400)

        const acquireX = [...acquireXInRange, 
            acquireXAtM2400
        ]

        const costY = [...costYInRange,
            costYAtM2400
        ]

        const totalAcquireX = calc.getSum(acquireX)
        const totalCostY = calc.amountListAddFee(costY, JSBI.BigInt(2000))

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
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        const {amountX, amountY} = SwapY2XModule.swapY2X(pool, totalCostY, highPoint)

        expect(amountX.toString()).toBe(totalAcquireX.toString())
        expect(amountY.toString()).toBe(totalCostY.toString())

    });

    test('test swapY2X liquidity and limit order, start with zero liquidityX, end with full limit order', () => {
        const liquidityData = [
            getDataPair(1000, 200000),
            // 2400
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('0')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2000

        const costYInRange = [
            calc.yInRange('200000', 2001, 2400, 1.0001, true),
        ]
        
        const acquireXInRange = [
            calc.xInRange('200000', 2001, 2400, 1.0001, false),
        ]

        const sellingYData = [] as DataPair[]
        const sellingXData = [
            getDataPair(2400, '1000000000000'),
            getDataPair(4000, '0')
        ]

        const highPoint = 3600

        const acquireXAtM2400 = sellingXData[0].data
        const costYAtM2400 = calc.getCostYFromXAtPoint(2400, acquireXAtM2400)

        const acquireX = [...acquireXInRange, 
            acquireXAtM2400
        ]

        const costY = [...costYInRange,
            costYAtM2400
        ]

        const totalAcquireX = calc.getSum(acquireX)
        const totalCostY = calc.amountListAddFee(costY, JSBI.BigInt(2000))

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
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        const {amountX, amountY} = SwapY2XModule.swapY2X(pool, totalCostY, highPoint)

        expect(amountX.toString()).toBe(totalAcquireX.toString())
        expect(amountY.toString()).toBe(totalCostY.toString())

    });

    test('test swapY2X liquidity, start with zero liquidityX, end with full liquidity', () => {
        const liquidityData = [
            getDataPair(1000, 200000),
            getDataPair(2400, 300000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('0')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2000

        const costYInRange = [
            calc.yInRange('200000', 2001, 2400, 1.0001, true),
        ]
        
        const acquireXInRange = [
            calc.xInRange('200000', 2001, 2400, 1.0001, false),
        ]

        const sellingYData = [] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const highPoint = 3600

        const acquireX = [...acquireXInRange]

        const costY = [...costYInRange]

        const totalAcquireX = calc.getSum(acquireX)
        const totalCostY = calc.amountListAddFee(costY, JSBI.BigInt(2000))

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
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        const {amountX, amountY} = SwapY2XModule.swapY2X(pool, totalCostY, highPoint)

        expect(amountX.toString()).toBe(totalAcquireX.toString())
        expect(amountY.toString()).toBe(totalCostY.toString())

    });

    test('test swapY2X liquidity, end with highPt', () => {
        const liquidityData = [
            getDataPair(1000, 200000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2000

        const costYInRange = [
            JSBI.add(
                calc.l2Y(liquidityX, LogPowMath.getSqrtPrice(2000), true),
                calc.yInRange('200000', 2001, 2400, 1.0001, true)
            )
        ]
        
        const acquireXInRange = [
            JSBI.add(
                calc.l2X(liquidityX, LogPowMath.getSqrtPrice(2000), false),
                calc.xInRange('200000', 2001, 2400, 1.0001, false)
            )
        ]

        const sellingYData = [] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const highPoint = 2400

        const acquireX = [...acquireXInRange]

        const costY = [...costYInRange]

        const totalAcquireX = calc.getSum(acquireX)
        const totalCostY = calc.amountListAddFee(costY, JSBI.BigInt(2000))

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
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)
        const veryBigNumber = JSBI.BigInt('100000000000000000000000000000')

        const {amountX, amountY} = SwapY2XModule.swapY2X(pool, veryBigNumber, highPoint)

        expect(amountX.toString()).toBe(totalAcquireX.toString())
        expect(amountY.toString()).toBe(totalCostY.toString())

    });

    test('test swapY2X liquidity and limit order, highPt = currentPt + 1', () => {
        const liquidityData = [
            getDataPair(1000, 200000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('20000')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2000

        const costYInRange = [
                calc.l2Y(liquidityX, LogPowMath.getSqrtPrice(2000), true),
        ]
        
        const acquireXInRange = [
                calc.l2X(liquidityX, LogPowMath.getSqrtPrice(2000), false),
        ]

        const sellingYData = [] as DataPair[]
        const sellingXData = [
            getDataPair(2000, '1000000000000'),
            getDataPair(4000, '0')
        ]

        const highPoint = 2001

        const acquireXAt2000 = sellingXData[0].data
        const costYAt2000 = calc.getCostYFromXAtPoint(2000, acquireXAt2000)

        const acquireX = [...acquireXInRange, acquireXAt2000]

        const costY = [...costYInRange, costYAt2000]

        const totalAcquireX = calc.getSum(acquireX)
        const totalCostY = calc.amountListAddFee(costY, JSBI.BigInt(2000))

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
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)
        const veryBigNumber = JSBI.BigInt('100000000000000000000000000000')

        const {amountX, amountY} = SwapY2XModule.swapY2X(pool, veryBigNumber, highPoint)

        expect(amountX.toString()).toBe(totalAcquireX.toString())
        expect(amountY.toString()).toBe(totalCostY.toString())

    });
})