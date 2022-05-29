
import {BaseChain, ChainId, initialChainTable } from '../../base/types'
import {privateKey} from '../../../.secret'
import Web3 from 'web3';
import { getLiquidityManagerContract, fetchLiquiditiesOfAccount } from '../../liquidityManager/view';
import { fetchToken } from '../../base/token/token';
import { BigNumber } from 'bignumber.js'
import { getDecLiquidityCall } from '../../liquidityManager/liquidity';
import { getWithdrawLiquidityValue } from '../../liquidityManager/calc';
import { DecLiquidityParam } from '../../liquidityManager/types';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
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

    const liquidities = await fetchLiquiditiesOfAccount(
        chain, 
        web3, 
        liquidityManagerContract,
        account.address,
        [testA]
    )
    console.log('liquidity len: ', liquidities.length)
    console.log('liquidtys: ', liquidities)

    const liquidity0 = liquidities[0]

    const decRate = 0.1
    const originLiquidity = new BigNumber(liquidity0.liquidity)
    const decLiquidity = originLiquidity.times(decRate)

    const {amountX, amountY} = getWithdrawLiquidityValue(
        liquidity0,
        liquidity0.state,
        decLiquidity
    )

    const minAmountX = amountX.times(0.985).toFixed(0)
    const minAmountY = amountY.times(0.985).toFixed(0)

    const gasPrice = '5000000000'

    const {decLiquidityCalling, options} = getDecLiquidityCall(
        liquidityManagerContract,
        account.address,
        chain,
        {
            tokenId: liquidity0.tokenId,
            liquidDelta: decLiquidity.toFixed(0),
            minAmountX,
            minAmountY
        } as DecLiquidityParam,
        gasPrice
    )

    const gasLimit = await decLiquidityCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await decLiquidityCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: liquidityManagerAddress,
            data: decLiquidityCalling.encodeABI(),
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