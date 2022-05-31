
import {BaseChain, ChainId, initialChainTable, PriceRoundingType} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { getPointDelta, getPoolContract, getPoolState } from '../../src/pool/funcs';
import { getPoolAddress, getLiquidityManagerContract } from '../../src/liquidityManager/view';
import { amount2Decimal, fetchToken } from '../../src/base/token/token';
import { pointDeltaRoundingDown, pointDeltaRoundingUp, priceDecimal2Point } from '../../src/base/price';
import { BigNumber } from 'bignumber.js'
import { calciZiLiquidityAmountDesired } from '../../src/liquidityManager/calc';
import { getMintCall } from '../../src/liquidityManager/liquidity';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSC]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    console.log('aaaaaaaa')
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const liquidityManagerAddress = '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581'
    const liquidityManagerContract = getLiquidityManagerContract(liquidityManagerAddress, web3)

    console.log('liquidity manager address: ', liquidityManagerAddress)

    const testAAddress = '0xCFD8A067e1fa03474e79Be646c5f6b6A27847399'
    const testBAddress = '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'

    const testA = await fetchToken(testAAddress, chain, web3)
    const testB = await fetchToken(testBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const poolAddress = await getPoolAddress(liquidityManagerContract, testA, testB, fee)
    const pool = getPoolContract(poolAddress, web3)

    const state = await getPoolState(pool)

    const point1 = priceDecimal2Point(testA, testB, 0.099870, PriceRoundingType.PRICE_ROUNDING_NEAREST)
    const point2 = priceDecimal2Point(testA, testB, 0.29881, PriceRoundingType.PRICE_ROUNDING_NEAREST)

    console.log('point1: ', point1)
    console.log('point2: ', point2)

    const pointDelta = await getPointDelta(pool)

    console.log('pointDelta: ', pointDelta)

    console.log(state)

    const leftPoint = pointDeltaRoundingDown(Math.min(point1, point2), pointDelta)
    const rightPoint = pointDeltaRoundingUp(Math.max(point1, point2), pointDelta)

    console.log('left point: ', leftPoint)
    console.log('right point: ', rightPoint)

    const maxTestA = new BigNumber(100).times(10 ** testA.decimal)
    const maxTestB = calciZiLiquidityAmountDesired(
        leftPoint, rightPoint, state.currentPoint,
        maxTestA, true, testA, testB
    )
    console.log('max testA: ', maxTestA.toFixed(0))
    console.log('max testB: ', maxTestB.toFixed(0))

    const maxTestBDecimal = amount2Decimal(maxTestB, testB)

    console.log('maxTestBDecimal: ', maxTestBDecimal)

    // esitmate gas
    const mintParams = {
        tokenA: testA,
        tokenB: testB,
        fee,
        leftPoint,
        rightPoint,
        maxAmountA: maxTestA.toFixed(0),
        maxAmountB: maxTestB.toFixed(0),
        minAmountA: maxTestA.times(0.985).toFixed(0),
        minAmountB: maxTestB.times(0.985).toFixed(0),
    }

    const gasPrice = '5000000000'

    const { mintCalling, options } = getMintCall(
        liquidityManagerContract,
        account.address,
        chain,
        mintParams,
        gasPrice
    )
    
    const gasLimit = await mintCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await collectLimitOrderCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: liquidityManagerAddress,
            data: mintCalling.encodeABI(),
            gas: new BigNumber(gasLimit * 1.1).toFixed(0, 2),
        }, 
        privateKey
    )
    // nonce += 1;
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('tx: ', tx);

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})