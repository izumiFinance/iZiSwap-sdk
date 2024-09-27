
import {BaseChain, ChainId, initialChainTable, PriceRoundingType } from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { decimal2Amount, fetchToken, getSwapTokenAddress } from '../../src/base/token/token'
import { getDeactiveSlot, getLimitOrderManagerContract, getPoolAddress } from '../../src/limitOrder/view';
import { getNewLimOrderCall } from '../../src/limitOrder/limitOrder';
import { AddLimOrderParam } from '../../src/limitOrder/types'
import { pointDeltaRoundingDown, pointDeltaRoundingUp, priceDecimal2Point } from '../../src/base/price'
import { BigNumber } from 'bignumber.js'
import { getPointDelta, getPoolContract } from '../../src/pool/funcs';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSC]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)
    const accountAddress = account.address

    const limitOrderAddress = '0x9Bf8399c9f5b777cbA2052F83E213ff59e51612B'
    const limitOrderManager = getLimitOrderManagerContract(limitOrderAddress, web3)

    console.log('limit order manager address: ', limitOrderAddress)

    const testAAddress = '0xCFD8A067e1fa03474e79Be646c5f6b6A27847399'
    const testBAddress = '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'

    const testA = await fetchToken(testAAddress, chain, web3)
    const testB = await fetchToken(testBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const sellToken = testA
    const earnToken = testB
    const sellPriceDecimalAByB = 0.25

    console.log('sellPriceDecimalAByB: ', sellPriceDecimalAByB)
    const sellPoint = priceDecimal2Point(sellToken, earnToken, sellPriceDecimalAByB, PriceRoundingType.PRICE_ROUNDING_UP)
    console.log('sellPoint: ', sellPoint)
    const poolAddress = await getPoolAddress(limitOrderManager, testA, testB, fee)
    const pool = getPoolContract(poolAddress, web3)
    const pointDelta = await getPointDelta(pool)
    console.log('point delta: ', pointDelta)
    let sellPointRoundingPointDelta = sellPoint
    console.log('sell token address: ', sellToken.address)
    console.log('earn token address: ', earnToken.address)
    if (getSwapTokenAddress(sellToken).toLowerCase() < getSwapTokenAddress(earnToken).toLowerCase()) {
        sellPointRoundingPointDelta = pointDeltaRoundingDown(sellPointRoundingPointDelta, pointDelta)
    } else {
        sellPointRoundingPointDelta = pointDeltaRoundingUp(sellPointRoundingPointDelta, pointDelta)
    }
    console.log('point rounding: ', sellPointRoundingPointDelta)
    const sellAmountDecimal = 1000
    const sellAmount = decimal2Amount(sellAmountDecimal, testA).toFixed(0)

    const gasPrice = '5000000000'

    const slotIdx = await getDeactiveSlot(limitOrderManager, accountAddress)
    console.log('slotIdx: ', slotIdx)
    const params : AddLimOrderParam = {
        idx: slotIdx,
        sellToken,
        earnToken,
        fee,
        point: sellPointRoundingPointDelta,
        sellAmount
    }
    const {newLimOrderCalling, options} = getNewLimOrderCall(
        limitOrderManager, 
        accountAddress, 
        chain, 
        params,
        gasPrice
    )
    // before estimate gas and send transaction, 
    // make sure you have approve limitOrderAddress of sellToken
    const gasLimit = await newLimOrderCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explore's wallet provider
    // one can easily use 
    //
    //    await newLimOrderCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: limitOrderAddress,
            data: newLimOrderCalling.encodeABI(),
            gas: new BigNumber(Number(gasLimit) * 1.1).toFixed(0, 2),
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