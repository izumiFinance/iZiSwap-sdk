
import {BaseChain, ChainId, initialChainTable, PriceRoundingType} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import http, { AgentOptions } from 'http'
import https from 'https'
import { getLiquidities, getLimitOrders, getPointDelta, getPoolContract, getPoolState } from '../../src/pool/funcs';
import { getPoolAddress, getLiquidityManagerContract } from '../../src/liquidityManager/view';
import { Orders } from '../../src/swapQuery/library/Orders'
import { LogPowMath } from '../../src/swapQuery/library/LogPowMath'
import { iZiSwapPool } from '../../src/swapQuery/iZiSwapPool'
import { amount2Decimal, decimal2Amount, fetchToken, getErc20TokenContract } from '../../src/base/token/token';
import { pointDeltaRoundingDown, pointDeltaRoundingUp, priceDecimal2Point } from '../../src/base/price';
import { BigNumber } from 'bignumber.js'
import { calciZiLiquidityAmountDesired } from '../../src/liquidityManager/calc';
import { getMintCall } from '../../src/liquidityManager/liquidity';
import { getQuoterContract, quoterSwapChainWithExactInput, quoterSwapChainWithExactOutput } from '../../src/quoter/funcs';
import { QuoterSwapChainWithExactInputParams, QuoterSwapChainWithExactOutputParams } from '../../src/quoter/types';
import { getSwapChainWithExactOutputCall, getSwapContract } from '../../src/swap/funcs';
import { SwapChainWithExactOutputParams } from '../../src/swap/types';
import { SwapQuery } from '../../src/swapQuery/library/State';
import { SwapX2YModule } from '../../src/swapQuery/swapX2YModule'
import JSBI from 'jsbi';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    // test net
    const rpc = 'https://data-seed-prebsc-1-s3.binance.org:8545/'
    console.log('rpc: ', rpc)
    
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))

    const liquidityManagerAddress = '0xDE02C26c46AC441951951C97c8462cD85b3A124c'
    const liquidityManagerContract = getLiquidityManagerContract(liquidityManagerAddress, web3)

    console.log('liquidity manager address: ', liquidityManagerAddress)

    const iZiAddress = '0x551197e6350936976DfFB66B2c3bb15DDB723250'.toLowerCase()
    const BNBAddress = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'.toLowerCase()

    const iZi = await fetchToken(iZiAddress, chain, web3)
    const BNB = await fetchToken(BNBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const poolAddress = await getPoolAddress(liquidityManagerContract, iZi, BNB, fee)

    const tokenXAddress = iZiAddress < BNBAddress ? iZiAddress : BNBAddress
    const tokenYAddress = iZiAddress < BNBAddress ? BNBAddress : iZiAddress

    const poolContract = getPoolContract(poolAddress, web3)

    const state = await getPoolState(poolContract)

    console.log('state: ', state)

    const pointDelta = await getPointDelta(poolContract)

    console.log('pointDelta: ', pointDelta)

    const leftPoint = state.currentPoint - 5000
    const rightPoint = state.currentPoint + 5000
    const batchsize = 2000

    const liquidityData = await getLiquidities(poolContract, leftPoint, rightPoint, state.currentPoint, pointDelta, state.liquidity, batchsize)

    console.log('liquidityData.liquidities: ', liquidityData.liquidities.map((e:JSBI)=>e.toString()))
    console.log('liquidityData.point: ', liquidityData.point)

    const limitOrderData = await getLimitOrders(poolContract, leftPoint, rightPoint, pointDelta, batchsize)

    console.log('limitOrderData.sellingX: ', limitOrderData.sellingX.map((e:JSBI)=>e.toString()))
    console.log('limitOrderData.sellingXPoint: ', limitOrderData.sellingXPoint)
    console.log('limitOrderData.sellingY: ', limitOrderData.sellingY.map((e:JSBI)=>e.toString()))
    console.log('limitOrderData.sellingYPoint: ', limitOrderData.sellingYPoint)

    const orders: Orders.Orders = {
        liquidity: liquidityData.liquidities,
        liquidityDeltaPoint: liquidityData.point,
        sellingX: limitOrderData.sellingX,
        sellingXPoint: limitOrderData.sellingXPoint,
        sellingY: limitOrderData.sellingY,
        sellingYPoint: limitOrderData.sellingYPoint
    }

    const sqrtRate_96 = LogPowMath.getSqrtPrice(1)

    const swapQueryState: SwapQuery.State = {
        currentPoint: state.currentPoint,
        liquidity: JSBI.BigInt(state.liquidity),
        sqrtPrice_96: LogPowMath.getSqrtPrice(state.currentPoint),
        liquidityX: JSBI.BigInt(state.liquidityX)
    }

    const pool = new iZiSwapPool(swapQueryState, orders, sqrtRate_96, pointDelta, fee)
    
    const lowPt = state.currentPoint - 1500;

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