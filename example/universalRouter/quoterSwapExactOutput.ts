
import {BaseChain, ChainId, initialChainTable, TokenInfoFormatted} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { amount2Decimal } from '../../src/base/token/token';
import { BigNumber } from 'bignumber.js'
import { getSwapExactOutputCall, getUniversalQuoterContract, getUniversalSwapRouterContract, quoteExactOutput } from '../../src/universalRouter'
import { SwapExactOutputParams } from '../../src/universalRouter/types';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://bsc-testnet-rpc.publicnode.com';
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const quoterAddress = '0xA55D57C62A1B998E4bDD956c31096b783b7ce1cF'
    const quoterContract = getUniversalQuoterContract(quoterAddress, web3)

    console.log('quoter address: ', quoterAddress)

    const USDC = {
        chainId: chain.id,
        symbol: 'USDC',
        address: '0x876508837C162aCedcc5dd7721015E83cbb4e339',
        decimal: 6
    } as TokenInfoFormatted;

    const USDT = {
        chainId: chain.id,
        symbol: 'USDT',
        address: '0x6AECfe44225A50895e9EC7ca46377B9397D1Bb5b',
        decimal: 6
    } as TokenInfoFormatted;

    const BNB = {
        chainId: chain.id,
        symbol: 'BNB', 
        address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
        decimal: 18,
    } as TokenInfoFormatted;

    const WBNB = {
        chainId: chain.id,
        symbol: 'WBNB', 
        address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
        decimal: 18,
    } as TokenInfoFormatted;

    const outputAmountDecimal = 0.2;
    const outputAmount = new BigNumber(outputAmountDecimal).times(10 ** WBNB.decimal).toFixed(0)
    
    // const outputAmountDecimal = 30;
    // const outputAmount = new BigNumber(outputAmountDecimal).times(10 ** USDT.decimal).toFixed(0)

    const quoterParams = {
        // note: 
        //     if you want to pay via native BNB/WBNB,
        //         just change first token in tokenChain to BNB/WBNB
        //         like [BNB, ... other tokens] or [WBNB, ... other tokens]
        //     and if you want to buy BNB/WBNB,
        //         you can just change the last token in tokenChain 
        //         to BNB/WBNB
        //         like [... other tokens, BNB] or [... other tokens, WBNB]
        //     Both of BNB and WBNB are defined in code above
        // tokenChain: [BNB, USDC, USDT],
        tokenChain: [USDT, USDC, BNB],

        // fee percent of pool(tokenChain[i], tokenChain[i+1]) 
        // 0.3 means fee tier of 0.3%
        //     only need for V3Pool
        //     for V2Pool, you can fill arbitrary value
        feeTier: [0.04, 0],
        // isV2[i] == true, means pool(tokenChain[i], tokenChain[i+1]) is a V2Pool
        // otherwise, the corresponding pool is V3Pool
        //     same length as feeTier
        isV2: [false, true],

        outputAmount,
        // "maxInputAmount" is not used in quoter
        //     and you can fill arbitrary value in quoter
        maxInputAmount: '0',
        // outChargeFeeTier% of trader's acquired token (outToken) 
        // will be additionally charged by universalRouter
        // if outChargeFeeTier is 0.2, 0.2% of outToken will be additionally charged
        // if outChargeFeeTier is 0, no outToken will be additionally charged
        // outChargeFeeTier should not be greater than 5 (etc, 5%)
        outChargeFeeTier: 0.2,
    } as SwapExactOutputParams;
    
    // whether limit maximum point range for each V3Pool in quoter
    const limit = true; 
    const {inputAmount} = await quoteExactOutput(quoterContract, quoterParams, limit);

    const inputAmountDecimal = amount2Decimal(new BigNumber(inputAmount), USDT)
    // const inputAmountDecimal = amount2Decimal(new BigNumber(inputAmount), BNB)

    console.log(' input amount decimal: ', inputAmountDecimal)
    console.log(' output amount decimal: ', outputAmountDecimal)

    const swapAddress = '0x8684E397A84D718dD65da5938B6985BA60C957c5'
    const swapContract = getUniversalSwapRouterContract(swapAddress, web3)

    // example of swap

    const swapParams = {
        ...quoterParams,
        // slippery is 1.5%
        maxInputAmount: new BigNumber(inputAmount).times(1.015).toFixed(0)
    } as SwapExactOutputParams
    
    const gasPrice = '5000000000'

    const {calling: swapCalling, options} = getSwapExactOutputCall(
        swapContract, 
        account.address, 
        chain, 
        swapParams, 
        gasPrice
    )

    // before estimate gas and send transaction, 
    // notice: if tokenChain[0] isn't native token
    //     make sure you have approve universalSwapRouter to operator your 
    //     tokenChain[0] 
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
            gas: new BigNumber(Number(gasLimit) * 1.1).toFixed(0, 2),
        }, 
        privateKey
    )
    // nonce += 1;
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string);
    console.log('tx: ', tx);

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})