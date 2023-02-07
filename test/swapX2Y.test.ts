import JSBI from "jsbi";
import { SwapQueryError } from "../src/swapQuery/error";
import { iZiSwapPool } from "../src/swapQuery/iZiSwapPool";
import { LogPowMath } from "../src/swapQuery/library/LogPowMath";
import { Orders } from "../src/swapQuery/library/Orders";
import { SwapQuery } from "../src/swapQuery/library/State";
import { SwapX2YModule } from "../src/swapQuery/swapX2YModule";
import { calc } from './funcs'
interface DataPair {
    point: number,
    data: JSBI
}

function getDataPair(point: number, data: number | string | JSBI): DataPair {
    return {point, data: JSBI.BigInt(data)}
}

describe("test swapX2Y", ()=>{
    test('test swapX2Y liquidity and limit order', () => {
        const liquidityData = [
            getDataPair(-4000, 300000),
            // -2800
            getDataPair(-2000, 200000),
            getDataPair(-1280, 500000),
            getDataPair(-1240, 600000),
            getDataPair(-1200, 0),
            // -1020
            getDataPair(-880, 100000),
            getDataPair(-200, 800000),
            getDataPair(600, 800000),
            // 720
            getDataPair(1200, 0),
            getDataPair(2200, 300000),
            // 2800
            // 3000
            getDataPair(3200, 200000)
        ]

        const liquidityX = JSBI.BigInt('200000')

        const acquireYInRange = [
            calc.yInRange(liquidityData[0].data.toString(), -3030, -2800, 1.0001, false),
            calc.yInRange(liquidityData[0].data.toString(), -2800, -2000, 1.0001, false),
            calc.yInRange(liquidityData[1].data.toString(), -2000, -1280, 1.0001, false),
            calc.yInRange(liquidityData[2].data.toString(), -1280, -1240, 1.0001, false),
            calc.yInRange(liquidityData[3].data.toString(), -1240, -1200, 1.0001, false),
            calc.yInRange(liquidityData[5].data.toString(), -880, -200, 1.0001, false),
            calc.yInRange(liquidityData[6].data.toString(), -200, 0, 1.0001, false),
            calc.yInRange(liquidityData[6].data.toString(), 0, 600, 1.0001, false),
            calc.yInRange(liquidityData[7].data.toString(), 600, 720, 1.0001, false),
            calc.yInRange(liquidityData[7].data.toString(), 720, 1200, 1.0001, false),
            calc.yInRange(liquidityData[9].data.toString(), 2200, 2800, 1.0001, false),
            JSBI.add(calc.yInRange(liquidityData[9].data.toString(), 2800, 3000, 1.0001, false),
            calc.l2Y(JSBI.subtract(liquidityData[9].data, liquidityX), LogPowMath.getSqrtPrice(3000), false))
        ]
        const costXInRange = [
            calc.xInRange(liquidityData[0].data.toString(), -3030, -2800, 1.0001, true),
            calc.xInRange(liquidityData[0].data.toString(), -2800, -2000, 1.0001, true),
            calc.xInRange(liquidityData[1].data.toString(), -2000, -1280, 1.0001, true),
            calc.xInRange(liquidityData[2].data.toString(), -1280, -1240, 1.0001, true),
            calc.xInRange(liquidityData[3].data.toString(), -1240, -1200, 1.0001, true),
            calc.xInRange(liquidityData[5].data.toString(), -880, -200, 1.0001, true),
            calc.xInRange(liquidityData[6].data.toString(), -200, 0, 1.0001, true),
            calc.xInRange(liquidityData[6].data.toString(), 0, 600, 1.0001, true),
            calc.xInRange(liquidityData[7].data.toString(), 600, 720, 1.0001, true),
            calc.xInRange(liquidityData[7].data.toString(), 720, 1200, 1.0001, true),
            calc.xInRange(liquidityData[9].data.toString(), 2200, 2800, 1.0001, true),
            JSBI.add(calc.xInRange(liquidityData[9].data.toString(), 2800, 3000, 1.0001, true),
            calc.l2X(JSBI.subtract(liquidityData[9].data, liquidityX), LogPowMath.getSqrtPrice(3000), true))
        ]

        const sellingYData = [
            getDataPair(-3600, '1000000000000'),
            getDataPair(-2800, '2000000000000'),
            getDataPair(-1020, '3000000000000'),
            getDataPair(-880, '2000000000000'),
            getDataPair(720, '2000000000000'),
            getDataPair(2800, '3000000000000'),
            getDataPair(3000, '1000000000000')
        ]
        const sellingXData = [
            getDataPair(3200, '2000000000000'),
            getDataPair(3600, '2000000000000')
        ]

        const lowPoint = -3050

        const acquireYAtM2800 = sellingYData[1].data
        const acquireYAtM1020 = sellingYData[2].data
        const acquireYAtM880 = sellingYData[3].data
        const acquireYAt720 = sellingYData[4].data
        const acquireYAt2800 = sellingYData[5].data
        const acquireYAt3000 = sellingYData[6].data

        const costXAtM2800 = calc.getCostXFromYAtPoint(-2800, acquireYAtM2800)
        const costXAtM1020 = calc.getCostXFromYAtPoint(-1020, acquireYAtM1020)
        const costXAtM880 = calc.getCostXFromYAtPoint(-880, acquireYAtM880)
        const costXAt720 = calc.getCostXFromYAtPoint(720, acquireYAt720)
        const costXAt2800 = calc.getCostXFromYAtPoint(2800, acquireYAt2800)
        const costXAt3000 = calc.getCostXFromYAtPoint(3000, acquireYAt3000)

        const acquireY = [...acquireYInRange, 
            acquireYAtM2800, 
            acquireYAtM1020, 
            acquireYAtM880, 
            acquireYAt720,
            acquireYAt2800,
            acquireYAt3000
        ]

        const costX = [...costXInRange,
            costXAtM2800,
            costXAtM1020,
            costXAtM880,
            costXAt720,
            costXAt2800,
            costXAt3000
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

        const currentPoint = 3000
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
            sqrtPrice_96: LogPowMath.getSqrtPrice(3000),
            // point = 3000
            // 2200 <= point < 3200, liquidity(point) is 300000
            liquidity: JSBI.BigInt('300000'),
            liquidityX
        }
        const sqrtRate_96 = LogPowMath.getSqrtPrice(1)
        const pointDelta = 40
        const pool = new iZiSwapPool(state, orders, sqrtRate_96, pointDelta, 2000)

        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountX.toString()).toBe(totalCostX.toString())
        expect(amountY.toString()).toBe(totalAcquireY.toString())

    });

    test('test swapX2Y liquidity and limit order, start with liquidityX=0, end with partial limit order', () => {
        const liquidityData = [
            getDataPair(-5000, 200000),
            // 2000
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('0')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2511

        const acquireYInRange = [
            calc.yInRange('200000', 2000, 2512, 1.0001, false),
        ]
        
        const costXInRange = [
            calc.xInRange('200000', 2000, 2512, 1.0001, true),
        ]

        const sellingYData = [
            getDataPair(-1000, '0'),
            getDataPair(2000, '1000000000000'),
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = -1

        const desireYAt2000 = JSBI.divide(sellingYData[1].data, JSBI.BigInt(11))
        const costXAt2000 = calc.getCostXFromYAtPoint(2000, desireYAt2000)
        const acquireYAt2000 = calc.getEarnYFromXAtPoint(2000, costXAt2000)

        const acquireY = [...acquireYInRange, 
            acquireYAt2000
        ]

        const costX = [...costXInRange,
            costXAt2000
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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

        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity and limit order, start with liquidityX=liquidity, end with full limit order', () => {
        const liquidityData = [
            getDataPair(-5000, 200000),
            // 2000
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('200000')
        const liquidity = JSBI.BigInt('200000')
        const currentPoint = 2511

        const acquireYInRange = [
            calc.yInRange('200000', 2000, 2511, 1.0001, false),
        ]
        
        const costXInRange = [
            calc.xInRange('200000', 2000, 2511, 1.0001, true),
        ]

        const sellingYData = [
            getDataPair(-1000, '0'),
            getDataPair(2000, '1000000000000'),
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = -1

        const acquireYAt2000 = sellingYData[1].data
        const costXAt2000 = calc.getCostXFromYAtPoint(2000, acquireYAt2000)

        const acquireY = [...acquireYInRange, 
            acquireYAt2000
        ]

        const costX = [...costXInRange,
            costXAt2000
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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

        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with zero liquidityX, end with full liquidity', () => {
        const liquidityData = [
            getDataPair(-80, 200000),
            getDataPair(80, 600000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('0')
        const liquidity = JSBI.BigInt('600000')
        const currentPoint = 2021

        const acquireYInRange = [
            calc.yInRange('600000', 80, 2022, 1.0001, false),
        ]
        
        const costXInRange = [
            calc.xInRange('600000', 80, 2022, 1.0001, true),
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = 1

        const acquireY = [...acquireYInRange]

        const costX = [...costXInRange]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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

        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with liquidityX partial, end with lowPt', () => {
        const liquidityData = [
            getDataPair(-80, 200000),
            getDataPair(80, 600000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('100000')
        const liquidity = JSBI.BigInt('600000')
        const currentPoint = 2021

        const acquireYInRange = [
            JSBI.add(
                calc.yInRange('600000', 180, 2021, 1.0001, false),
                calc.l2Y(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), false)
            )
        ]
        
        const costXInRange = [
            JSBI.add(
                calc.xInRange('600000', 180, 2021, 1.0001, true),
                calc.l2X(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), true)
            )
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = 180

        const acquireY = [...acquireYInRange]

        const costX = [...costXInRange]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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

        const veryBigNumber = JSBI.BigInt('100000000000000000000000000')
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, veryBigNumber, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with liquidityX partial, end with lowPt=currentPoint', () => {
        const liquidityData = [
            getDataPair(-80, 200000),
            getDataPair(80, 600000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('100000')
        const liquidity = JSBI.BigInt('600000')
        const currentPoint = 2021

        const acquireYInRange = [
            calc.l2Y(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), false)
        ]
        
        const costXInRange = [
            calc.l2X(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), true)
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = currentPoint

        const acquireY = [...acquireYInRange]

        const costX = [...costXInRange]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const veryBigNumber = JSBI.BigInt('100000000000000000000000000')
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, veryBigNumber, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with liquidityX partial, end with lowPt=currentPoint-1', () => {
        const liquidityData = [
            getDataPair(-80, 200000),
            getDataPair(80, 600000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('100000')
        const liquidity = JSBI.BigInt('600000')
        const currentPoint = 2021

        const acquireYInRange = [
            JSBI.add(
                calc.yInRange('600000', 2020, 2021, 1.0001, false),
                calc.l2Y(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), false)
            )
        ]
        
        const costXInRange = [
            JSBI.add(
                calc.xInRange('600000', 2020, 2021, 1.0001, true),
                calc.l2X(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), true)
            )
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = currentPoint - 1

        const acquireY = [...acquireYInRange]

        const costX = [...costXInRange]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const veryBigNumber = JSBI.BigInt('100000000000000000000000000')
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, veryBigNumber, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with liquidityX partial, end with lowPt=liqudityPoint[0]', () => {
        const liquidityData = [
            getDataPair(80, 600000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('100000')
        const liquidity = JSBI.BigInt('600000')
        const currentPoint = 2021

        const acquireYInRange = [
            JSBI.add(
                calc.yInRange('600000', 80, 2021, 1.0001, false),
                calc.l2Y(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), false)
            )
        ]
        
        const costXInRange = [
            JSBI.add(
                calc.xInRange('600000', 80, 2021, 1.0001, true),
                calc.l2X(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), true)
            )
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = 80

        const acquireY = [...acquireYInRange]

        const costX = [...costXInRange]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const veryBigNumber = JSBI.BigInt('100000000000000000000000000')
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, veryBigNumber, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with liquidityX partial, end with lowPt=sellingYPoint[0]', () => {
        const liquidityData = [
            getDataPair(80, 600000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('100000')
        const liquidity = JSBI.BigInt('600000')
        const currentPoint = 2021

        const acquireYInRange = [
            JSBI.add(
                calc.yInRange('600000', 280, 2021, 1.0001, false),
                calc.l2Y(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), false)
            )
        ]
        
        const costXInRange = [
            JSBI.add(
                calc.xInRange('600000', 280, 2021, 1.0001, true),
                calc.l2X(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2021), true)
            )
        ]

        const sellingYData = [
            getDataPair(280, '100000000000')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const acquireYAt280 = sellingYData[0].data
        const costXAt280 = calc.getCostXFromYAtPoint(280, acquireYAt280)

        const lowPoint = 280

        const acquireY = [
            ...acquireYInRange, 
            // acquireYAt280
        ]

        const costX = [
            ...costXInRange, 
            // costXAt280
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const veryBigNumber = JSBI.BigInt('100000000000000000000000000')
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, veryBigNumber, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())
        

    });

    test('test swapX2Y liquidity, start with liquidityX partial, currentPoint is liquidityPoint', () => {
        const liquidityData = [
            getDataPair(80, 600000),
            getDataPair(2000, 800000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('300000')
        const liquidity = JSBI.BigInt('800000')
        const currentPoint = 2000

        const acquireYInRange = [
            calc.yInRange('600000', 88, 2000, 1.0001, false),
            calc.l2Y(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2000), false)
        ]
        
        const costXInRange = [
            calc.xInRange('600000', 88, 2000, 1.0001, true),
            calc.l2X(JSBI.BigInt('500000'), LogPowMath.getSqrtPrice(2000), true)
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = 80

        const acquireY = [
            ...acquireYInRange, 
        ]

        const costX = [
            ...costXInRange, 
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });

    test('test swapX2Y liquidity, start with liquidityX=0, currentPoint is liquidityPoint', () => {
        const liquidityData = [
            getDataPair(80, 600000),
            getDataPair(2000, 800000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('0')
        const liquidity = JSBI.BigInt('800000')
        const currentPoint = 2000

        const acquireYInRange = [
            calc.yInRange('600000', 88, 2000, 1.0001, false),
            calc.l2Y(JSBI.BigInt('800000'), LogPowMath.getSqrtPrice(2000), false)
        ]
        
        const costXInRange = [
            calc.xInRange('600000', 88, 2000, 1.0001, true),
            calc.l2X(JSBI.BigInt('800000'), LogPowMath.getSqrtPrice(2000), true)
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = 80

        const acquireY = [
            ...acquireYInRange, 
        ]

        const costX = [
            ...costXInRange, 
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });


    test('test swapX2Y liquidity, start with liquidityX=liquidity, currentPoint is liquidityPoint', () => {
        const liquidityData = [
            getDataPair(80, 600000),
            getDataPair(2000, 800000),
            getDataPair(3600, 0),
        ]

        const liquidityX = JSBI.BigInt('800000')
        const liquidity = JSBI.BigInt('800000')
        const currentPoint = 2000

        const acquireYInRange = [
            calc.yInRange('600000', 88, 2000, 1.0001, false),
        ]
        
        const costXInRange = [
            calc.xInRange('600000', 88, 2000, 1.0001, true),
        ]

        const sellingYData = [
            getDataPair(-4000, '0')
        ] as DataPair[]
        const sellingXData = [
            getDataPair(4000, '0')
        ]

        const lowPoint = 80

        const acquireY = [
            ...acquireYInRange, 
        ]

        const costX = [
            ...costXInRange, 
        ]

        const totalAcquireY = calc.getSum(acquireY)
        const totalCostX = calc.amountListAddFee(costX, JSBI.BigInt(2000))

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
        const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, totalCostX, lowPoint)

        expect(amountY.toString()).toBe(totalAcquireY.toString())
        expect(amountX.toString()).toBe(totalCostX.toString())

    });
})