
import {BaseChain, ChainId, initialChainTable, TokenInfoFormatted} from '../../src/base/types'
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js'
import { getSwapContract, getSwapSingleWithExactInputCall } from '../../src/swap/funcs'

import { privateKey } from '../../.secret'
import { SwapSingleWithExactInputParams } from '../../src/swap/types';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.ZkSyncAlphaTest]
    const rpc = 'https://testnet.era.zksync.dev'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('account address: ', account.address)

    const swapAddress = '0x3040EE148D09e5B92956a64CDC78b49f48C0cDdc'

    const swapContract = getSwapContract(swapAddress, web3)

    const ETH = {
        chainId: ChainId.ZkSyncAlphaTest,
        symbol: "ETH",
        address: "0x294cB514815CAEd9557e6bAA2947d6Cf0733f014",
        decimal: 18
    } as TokenInfoFormatted

    const USDC = {
        chainId: ChainId.ZkSyncAlphaTest,
        symbol: "USDC",
        address: "0x0faF6df7054946141266420b43783387A78d82A9",
        decimal: 6
    } as TokenInfoFormatted

    // example of exact input amount
    const amountInput = "2002339180468410"
    const params : SwapSingleWithExactInputParams = {
        inputToken: ETH,
        outputToken: USDC,
        fee: 400,
        inputAmount: amountInput,
        minOutputAmount: '0',
    }
    const gasPrice = '250000000'
    const {swapCalling, options} = getSwapSingleWithExactInputCall(
        swapContract,
        account.address,
        chain,
        params,
        gasPrice
    )

    console.log('before estimate gas')
    console.log('options: ', options)
    
    const gasLimit = await swapCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

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

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})

