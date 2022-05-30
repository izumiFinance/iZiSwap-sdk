
import {BaseChain, ChainId, initialChainTable, PriceRoundingType} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { getPointDelta, getPoolContract, getPoolState } from '../../src/pool/funcs';
import { getPoolAddress, getLiquidityManagerContract } from '../../src/liquidityManager/view';
import { amount2Decimal, fetchToken, getErc20TokenContract } from '../../src/base/token/token';
import { pointDeltaRoundingDown, pointDeltaRoundingUp, priceDecimal2Point } from '../../src/base/price';
import { BigNumber } from 'bignumber.js'
import { calciZiLiquidityAmountDesired } from '../../src/liquidityManager/calc';
import { getMintCall } from '../../src/liquidityManager/liquidity';
import { getQuoterContract, quoterSwapChainWithExactInput, quoterSwapChainWithExactOutput } from '../../src/quoter/funcs';
import { QuoterSwapChainWithExactInputParams, QuoterSwapChainWithExactOutputParams } from '../../src/quoter/types';
import { getSwapChainWithExactOutputCall, getSwapContract } from '../../src/swap/funcs';
import { SwapChainWithExactOutputParams } from '../../src/swap/types';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    console.log('aaaaaaaa')
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const quoterAddress = '0x12a76434182c8cAF7856CE1410cD8abfC5e2639F'
    const quoterContract = getQuoterContract(quoterAddress, web3)

    console.log('quoter address: ', quoterAddress)

    const testAAddress = '0xCFD8A067e1fa03474e79Be646c5f6b6A27847399'
    const testBAddress = '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'

    const testA = await fetchToken(testAAddress, chain, web3)
    const testB = await fetchToken(testBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const amountB = new BigNumber(10).times(10 ** testA.decimal)

    const params = {
        // pay testA to buy testB
        tokenChain: [testA, testB],
        feeChain: [fee],
        outputAmount: amountB.toFixed(0)
    } as QuoterSwapChainWithExactOutputParams

    const {inputAmount} = await quoterSwapChainWithExactOutput(quoterContract, params)

    const amountA = inputAmount
    const amountADecimal = amount2Decimal(new BigNumber(amountA), testA)

    console.log(' amountB to desired: ', 10)
    console.log(' amountA to pay: ', amountADecimal)

    const swapAddress = '0xBd3bd95529e0784aD973FD14928eEDF3678cfad8'
    const swapContract = getSwapContract(swapAddress, web3)

    // example of swap

    const swapParams = {
        ...params,
        // slippery is 1.5%
        maxInputAmount: new BigNumber(amountA).times(1.015).toFixed(0)
    } as SwapChainWithExactOutputParams
    
    const gasPrice = '5000000000'

    const tokenA = testA
    const tokenB = testB
    const tokenAContract = getErc20TokenContract(tokenA.address, web3)
    const tokenBContract = getErc20TokenContract(tokenB.address, web3)

    const tokenABalanceBeforeSwap = await tokenAContract.methods.balanceOf(account.address).call()
    const tokenBBalanceBeforeSwap = await tokenBContract.methods.balanceOf(account.address).call()

    console.log('tokenABalanceBeforeSwap: ', tokenABalanceBeforeSwap)
    console.log('tokenBBalanceBeforeSwap: ', tokenBBalanceBeforeSwap)

    const {swapCalling, options} = getSwapChainWithExactOutputCall(
        swapContract, 
        account.address, 
        chain, 
        swapParams, 
        gasPrice
    )

    // before estimate gas and send transaction, 
    // make sure you have approve swapAddress of token testA
    const gasLimit = await swapCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await swapCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: swapAddress,
            data: swapCalling.encodeABI(),
            gas: new BigNumber(gasLimit * 1.1).toFixed(0, 2),
        }, 
        privateKey
    )
    // nonce += 1;
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('tx: ', tx);

    const tokenABalanceAfterSwap = await tokenAContract.methods.balanceOf(account.address).call()
    const tokenBBalanceAfterSwap = await tokenBContract.methods.balanceOf(account.address).call()

    console.log('tokenABalanceAfterSwap: ', tokenABalanceAfterSwap)
    console.log('tokenBBalanceAfterSwap: ', tokenBBalanceAfterSwap)

    console.log('payed A: ', new BigNumber(tokenABalanceBeforeSwap.toString()).minus(tokenABalanceAfterSwap.toString()).toFixed(0))
    console.log('acquired B: ', new BigNumber(tokenBBalanceAfterSwap.toString()).minus(tokenBBalanceBeforeSwap.toString()).toFixed(0))

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})