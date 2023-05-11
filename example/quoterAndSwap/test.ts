
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
import { getQuoterContract, quoterSwapChainWithExactInput, quoterSwapChainWithExactOutput, quoterSwapSingleWithExactInput } from '../../src/quoter/funcs';
import { QuoterSwapChainWithExactInputParams, QuoterSwapChainWithExactOutputParams, QuoterSwapSingleWithExactInputParams } from '../../src/quoter/types';
import { getSwapChainWithExactOutputCall, getSwapContract } from '../../src/swap/funcs';
import { SwapChainWithExactOutputParams } from '../../src/swap/types';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSC]
    const rpc = 'https://bsc-dataseed1.binance.org/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const quoterAddress = '0x64b005eD986ed5D6aeD7125F49e61083c46b8e02'
    const quoterContract = getQuoterContract(quoterAddress, web3)

    console.log('quoter address: ', quoterAddress)

    const bnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    const usdcAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'

    const bnb = await fetchToken(bnbAddress, chain, web3)
    const usdc = await fetchToken(usdcAddress, chain, web3)
    const fee = 100 // 2000 means 0.2%

    const amountUSDC = '631534740637198503'
    const amountBNB = '2113338546812891'

    const params = {
        // pay testA to buy testB
        inputToken: bnb,
        outputToken: usdc,
        fee,
        inputAmount: amountBNB,
        boundaryPt: 0,
    } as QuoterSwapSingleWithExactInputParams

    const {outputAmount, finalPoint} = await quoterSwapSingleWithExactInput(quoterContract, params)
    console.log('output amount: ', outputAmount)
    console.log('finalpoint: ', finalPoint)
}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})