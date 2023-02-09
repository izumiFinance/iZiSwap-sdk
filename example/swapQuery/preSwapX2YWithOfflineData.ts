
import { TokenInfoFormatted } from '../../src/base/types'
import { Orders } from '../../src/swapQuery/library/Orders'
import { LogPowMath } from '../../src/swapQuery/library/LogPowMath'
import { iZiSwapPool } from '../../src/swapQuery/iZiSwapPool'
import { decimal2Amount } from '../../src/base/token/token';
import { SwapQuery } from '../../src/swapQuery/library/State';
import { SwapX2YModule } from '../../src/swapQuery/swapX2YModule'
import JSBI from 'jsbi';
import { State } from '../../src/pool/types';

async function main(): Promise<void> {
    
    const state = {
        sqrtPrice_96: '737245509137951174123944801',
        currentPoint: -93548,
        observationCurrentIndex: 14,
        observationQueueLen: 50,
        observationNextQueueLen: 50,
        liquidity: '523230926682255801',
        liquidityX: '25090486294305875'
    } as State
    console.log('state: ', state)

    const pointDelta = 40

    console.log('pointDelta: ', pointDelta)

    const liquidity = [
        '26728378980016527',
        '1918546082716318',
        '7295067906501307',
        '523230926682255801',
        '517854404858470812',
        '1918546082716318'
    ].map((e:string)=>JSBI.BigInt(e))

    const liquidityDeltaPoint = [ -98560, -93920, -93760, -93720, -93360, -93280 ]

    const sellingX = [] as JSBI[]
    const sellingXPoint = [] as number[]

    const sellingY = [ '0', '100000000000000000', '1200000000000000', '422993654872524085' ].map((e:string)=>JSBI.BigInt(e))
    const sellingYPoint = [ -98560, -94760, -93920, -93560 ]

    const orders: Orders.Orders = {
        liquidity,
        liquidityDeltaPoint,
        sellingX,
        sellingXPoint,
        sellingY,
        sellingYPoint,
    }

    const sqrtRate_96 = LogPowMath.getSqrtPrice(1)

    const swapQueryState: SwapQuery.State = {
        currentPoint: state.currentPoint,
        liquidity: JSBI.BigInt(state.liquidity),
        sqrtPrice_96: LogPowMath.getSqrtPrice(state.currentPoint),
        liquidityX: JSBI.BigInt(state.liquidityX)
    }

    const fee = 2000
    const pool = new iZiSwapPool(swapQueryState, orders, sqrtRate_96, pointDelta, fee)
    
    const lowPt = state.currentPoint - 1500;

    const iZi = {
        address: '0x551197e6350936976DfFB66B2c3bb15DDB723250',
        decimal: 18
    } as TokenInfoFormatted
    const inputAmountStr = decimal2Amount(5, iZi).toFixed(0)

    const {amountX, amountY} = SwapX2YModule.swapX2Y(pool, JSBI.BigInt(inputAmountStr), lowPt)
    
    console.log('cost: ', amountX.toString())
    console.log('acquire: ', amountY.toString())

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})