
import {BaseChain, ChainId, initialChainTable, TokenInfoFormatted} from '../../src/base/types'
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js'
import { getMulticallContracts } from '../../src/base';
import { PoolPair, SearchPathQueryParams, SwapDirection } from '../../src/search/types';
import { searchPathQuery } from '../../src/search/func'

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://data-seed-prebsc-1-s3.binance.org:8545/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    
    const quoterAddress = '0x4bCACcF9A0FC3246449AC8A42A8918F2349Ed543'

    const BNB = {
        chainId: ChainId.BSCTestnet,
        symbol: "BNB",
        address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
        decimal: 18,
    } as TokenInfoFormatted
    
    const USDT = {
        chainId: ChainId.BSCTestnet,
        symbol: "USDT",
        address: "0x6AECfe44225A50895e9EC7ca46377B9397D1Bb5b",
        decimal: 6
    } as TokenInfoFormatted

    const USDC = {
        chainId: ChainId.BSCTestnet,
        symbol: "USDC",
        address: "0x876508837C162aCedcc5dd7721015E83cbb4e339",
        decimal: 6
    }

    const iZi = {
        chainId: ChainId.BSCTestnet,
        symbol: "iZi",
        address: "0x60D01EC2D5E98Ac51C8B4cF84DfCCE98D527c747",
        decimal: 18
    }

    const iUSD = {
        chainId: ChainId.BSCTestnet,
        symbol: "iUSD",
        address: "0x60FE1bE62fa2082b0897eA87DF8D2CfD45185D30",
        decimal: 18,
    }

    const support001Pools = [
        {
            tokenA: iUSD,
            tokenB: USDT,
            feeContractNumber: 100
        } as PoolPair,
        {
            tokenA: USDC,
            tokenB: USDT,
            feeContractNumber: 100
        } as PoolPair,
        {
            tokenA: USDC,
            tokenB: iUSD,
            feeContractNumber: 100
        } as PoolPair,
    ]

    // example of exact output amount
    const amountInputUSDT = new BigNumber(200).times(10 ** USDT.decimal).toFixed(0)
    
    const multicallAddress = '0x5712A9aeB4538104471dD85659Bd621Cdd7e07D8'
    const multicallContract = getMulticallContracts(multicallAddress, web3)
    const liquidityManagerAddress = '0xDE02C26c46AC441951951C97c8462cD85b3A124c'

    // params
    const searchParams = {
        chainId: Number(ChainId.BSCTestnet),
        web3: web3,
        multicall: multicallContract,
        tokenIn: BNB,
        tokenOut: USDT,
        liquidityManagerAddress,
        quoterAddress,
        poolBlackList: [],
        midTokenList: [BNB, USDT, USDC, iZi],
        supportFeeContractNumbers: [2000, 400, 100],
        support001Pools,
        direction: SwapDirection.ExactOut,
        amount: amountInputUSDT
    } as SearchPathQueryParams

    // pathQueryResult stores optimized swap-path 
    //     and estimated swap-amount (output amount for exactIn, and input amount for exactOut)
    // preQueryResult caches data of pools and their state (current point) 
    //     which will be used during path-searching
    //     preQueryResult can be used for speed-up for next search
    //     etc, if you want to speed up a little next search, 
    //     just use following code:
    //     await searchPathQuery(searchParams, preQueryResult)
    //     cached data in preQueryResult can be used for different
    //     pair of <inputToken, outputToken> or different direction
    //     but notice that, cached data in preQueryResult can not be
    //     used in different chain
    const {pathQueryResult, preQueryResult} = await searchPathQuery(
        searchParams
    )

    // print output amount
    console.log('output amount: ', pathQueryResult.amount)
    // print path info
    // which can be filled to swap params
    // see example of "example/quoterAndSwap/"
    console.log('fee chain: ', pathQueryResult.path.feeContractNumber)
    console.log('token chain: ', pathQueryResult.path.tokenChain)

    // print other info
    console.log('price impact: ', pathQueryResult.priceImpact)
    console.log('init price of endToken by startToken', pathQueryResult.initDecimalPriceEndByStart)
    console.log('fee cost (decimal amount): ', pathQueryResult.feesDecimal)

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})

