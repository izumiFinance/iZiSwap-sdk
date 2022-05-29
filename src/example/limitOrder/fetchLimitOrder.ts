
import {BaseChain, ChainId, initialChainTable } from '../../base/types'
import {privateKey} from '../../../.secret'
import Web3 from 'web3';
import { fetchToken } from '../../base/token/token';
import { fetchLimitOrderOfAccount, getLimitOrderManagerContract } from '../../limitOrder/view';
import { getDecLimOrderCall } from '../../limitOrder/limitOrder';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSC]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    console.log('aaaaaaaa')
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
        chain, web3, limitOrderManager, account.address, [testA]
    )

    console.log('active orders len: ', activeOrders.length)
    console.log('deactive orders len: ', deactiveOrders.length)
    console.log(activeOrders)
    
}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})