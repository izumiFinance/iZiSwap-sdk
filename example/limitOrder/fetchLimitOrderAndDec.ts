
import {BaseChain, ChainId, initialChainTable } from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { fetchToken } from '../../src/base/token/token'
import { fetchLimitOrderOfAccount, getLimitOrderManagerContract } from '../../src/limitOrder/view';
import { getDecLimOrderCall } from '../../src/limitOrder/limitOrder'
import { BigNumber } from 'bignumber.js'

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSC]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const limitOrderAddress = '0x9Bf8399c9f5b777cbA2052F83E213ff59e51612B'
    const limitOrderManager = getLimitOrderManagerContract(limitOrderAddress, web3)

    console.log('limit order manager address: ', limitOrderAddress)

    const testAAddress = '0xCFD8A067e1fa03474e79Be646c5f6b6A27847399'
    const testBAddress = '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'

    const testA = await fetchToken(testAAddress, chain, web3)
    const testB = await fetchToken(testBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    // fetch limit order
    const {activeOrders, deactiveOrders} = await fetchLimitOrderOfAccount(
        chain, web3, limitOrderManager, '0xD0B1c02E8A6CA05c7737A3F4a0EEDe075fa4920C', [testA]
    )

    console.log('active orders len: ', activeOrders.length)
    console.log('deactive orders len: ', deactiveOrders.length)
    console.log(activeOrders)

    const activeOrderAt2 = activeOrders[2]
    const orderIdx = activeOrderAt2.idx

    console.log('limit order idx to dec: ', orderIdx)

    const gasPrice = '5000000000'
    // dec limit order of orderIdx
    const {decLimOrderCalling, options} = getDecLimOrderCall(
        limitOrderManager,
        orderIdx,
        activeOrderAt2.sellingRemain,
        '0xffffffff',
        account.address,
        chain,
        gasPrice
    )

    const gasLimit = await decLimOrderCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await decLimOrderCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: limitOrderAddress,
            data: decLimOrderCalling.encodeABI(),
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