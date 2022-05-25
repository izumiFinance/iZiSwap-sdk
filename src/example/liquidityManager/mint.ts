
import {BaseChain, ChainId, initialChainTable, PriceRoundingType} from '../../base/types'
import {privateKey} from '../../../.secret'
import Web3 from 'web3';
import { getPointDelta, getPoolContract, getPoolState } from '../../pool/funcs';
import { getPoolAddress, getLiquidityManagerContract } from '../../liquidityManager/view';
import { amount2Decimal, fetchToken } from '../../base/token/token';
import { pointDeltaRoundingDown, pointDeltaRoundingUp, priceDecimal2Point } from '../../base/price';
import { BigNumber } from 'bignumber.js'
import { calciZiLiquidityAmountDesired } from '../../liquidityManager/calc';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    console.log('aaaaaaaa')
    web3.eth.accounts.privateKeyToAccount(privateKey)

    const liquidityManagerAddress = '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581'
    const liquidityManagerContract = getLiquidityManagerContract(liquidityManagerAddress, web3)

    console.log('liquidity manager address: ', liquidityManagerAddress)

    const wbnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955'

    const wbnb = await fetchToken(wbnbAddress, chain, web3)
    const usdt = await fetchToken(usdtAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const poolAddress = await getPoolAddress(liquidityManagerContract, wbnb, usdt, fee)
    const pool = getPoolContract(poolAddress, web3)

    const state = await getPoolState(pool)

    const point1 = priceDecimal2Point(usdt, wbnb, 0.0024401, PriceRoundingType.PRICE_ROUNDING_NEAREST)
    const point2 = priceDecimal2Point(usdt, wbnb, 0.0036548, PriceRoundingType.PRICE_ROUNDING_NEAREST)

    console.log('point1: ', point1)
    console.log('point2: ', point2)

    const pointDelta = await getPointDelta(pool)

    console.log('pointDelta: ', pointDelta)

    console.log(state)

    const leftPoint = pointDeltaRoundingDown(Math.min(point1, point2), pointDelta)
    const rightPoint = pointDeltaRoundingUp(Math.max(point1, point2), pointDelta)

    console.log('left point: ', leftPoint)
    console.log('right point: ', rightPoint)

    const maxUsdt = new BigNumber(4000).times(10 ** usdt.decimal)
    const maxWbnb = calciZiLiquidityAmountDesired(
        leftPoint, rightPoint, state.currentPoint,
        maxUsdt, false, wbnb, usdt
    )
    console.log('max wbnb: ', maxWbnb.toFixed(0))

    const maxWbnbDecimal = amount2Decimal(maxWbnb, wbnb)

    console.log('maxWbnbDecimal: ', maxWbnbDecimal)

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})