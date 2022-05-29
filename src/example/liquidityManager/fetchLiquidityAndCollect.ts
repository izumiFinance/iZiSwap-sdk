
import {BaseChain, ChainId, initialChainTable } from '../../base/types'
import {privateKey} from '../../../.secret'
import Web3 from 'web3';
import { getLiquidityManagerContract, fetchLiquiditiesOfAccount } from '../../liquidityManager/view';
import { fetchToken, getErc20TokenContract } from '../../base/token/token';
import { BigNumber } from 'bignumber.js'
import { getCollectLiquidityCall, getDecLiquidityCall } from '../../liquidityManager/liquidity';
import { getWithdrawLiquidityValue } from '../../liquidityManager/calc';
import { CollectLiquidityParam, DecLiquidityParam } from '../../liquidityManager/types';

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
        '0xD0B1c02E8A6CA05c7737A3F4a0EEDe075fa4920C',
        [testA]
    )
    console.log('liquidity len: ', liquidities.length)
    console.log('liquidtys: ', liquidities)

    const liquidity0 = liquidities[0]

    const tokenA = liquidity0.tokenX
    const tokenB = liquidity0.tokenY

    const maxAmountA = liquidity0.remainTokenX
    const maxAmountB = liquidity0.remainTokenY

    console.log('tokenA: ', tokenA)
    console.log('tokenB: ', tokenB)

    console.log('maxAmountA: ', maxAmountA)
    console.log('maxAmountB: ', maxAmountB)

    const tokenAContract = getErc20TokenContract(tokenA.address, web3)
    const tokenBContract = getErc20TokenContract(tokenB.address, web3)

    const tokenABalanceBeforeCollect = await tokenAContract.methods.balanceOf(account.address).call()
    const tokenBBalanceBeforeCollect = await tokenBContract.methods.balanceOf(account.address).call()

    console.log('tokenABalanceBeforeCollect: ', tokenABalanceBeforeCollect.toString())
    console.log('tokenBBalanceBeforeCollect: ', tokenBBalanceBeforeCollect.toString())

    const gasPrice = '5000000000'

    const {collectLiquidityCalling, options} = getCollectLiquidityCall(
        liquidityManagerContract,
        account.address,
        chain,
        {
            tokenId: liquidity0.tokenId,
            tokenA,
            tokenB,
            maxAmountA,
            maxAmountB
        } as CollectLiquidityParam,
        gasPrice
    )

    const gasLimit = await collectLiquidityCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await collectLiquidityCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: liquidityManagerAddress,
            data: collectLiquidityCalling.encodeABI(),
            gas: new BigNumber(gasLimit * 1.1).toFixed(0, 2),
        }, 
        privateKey
    )
    // nonce += 1;
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('tx: ', tx);


    const tokenABalanceAfterCollect = await tokenAContract.methods.balanceOf(account.address).call()
    const tokenBBalanceAfterCollect = await tokenBContract.methods.balanceOf(account.address).call()

    console.log('tokenABalanceAfterCollect: ', tokenABalanceAfterCollect.toString())
    console.log('tokenBBalanceAfterCollect: ', tokenBBalanceAfterCollect.toString())

    console.log('collectA: ', new BigNumber(tokenABalanceAfterCollect.toString()).minus(tokenABalanceBeforeCollect.toString()).toFixed(0))
    console.log('collectB: ', new BigNumber(tokenBBalanceAfterCollect.toString()).minus(tokenBBalanceBeforeCollect.toString()).toFixed(0))


}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})