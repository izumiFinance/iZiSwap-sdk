
import {BaseChain, ChainId, initialChainTable, PriceRoundingType} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import http, { AgentOptions } from 'http'
import https from 'https'
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
    // test net
    const rpc = 'https://data-seed-prebsc-1-s3.binance.org:8545/'
    console.log('rpc: ', rpc)
    const options = {
        agent: {
            http: new http.Agent({} as AgentOptions),
            https: new https.Agent({} as AgentOptions),
            baseUrl: 'http://127.0.0.1:1087'
        }
    }
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc/*, options*/))

    const liquidityManagerAddress = '0xDE02C26c46AC441951951C97c8462cD85b3A124c'
    const liquidityManagerContract = getLiquidityManagerContract(liquidityManagerAddress, web3)

    console.log('liquidity manager address: ', liquidityManagerAddress)

    const iZiAddress = '0x551197e6350936976DfFB66B2c3bb15DDB723250'.toLowerCase()
    const BNBAddress = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'.toLowerCase()

    const iZi = await fetchToken(iZiAddress, chain, web3)
    const BNB = await fetchToken(BNBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const poolAddress = await getPoolAddress(liquidityManagerContract, iZi, BNB, 2000)

    const tokenXAddress = iZiAddress < BNBAddress ? iZiAddress : BNBAddress
    const tokenYAddress = iZiAddress < BNBAddress ? BNBAddress : iZiAddress

    const poolContract = getPoolContract(poolAddress, web3)

    const state = await getPoolState(poolContract)

    console.log('state: ', state)

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})