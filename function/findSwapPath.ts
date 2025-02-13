import {
    BaseChain,
    ChainId,
    initialChainTable,
    TokenInfoFormatted,
} from "../src/base/types";

import Web3 from "web3";
import { BigNumber } from "bignumber.js";
import { getMulticallContracts } from "../src/base";
import {
    PoolPair,
    SearchPathQueryParams,
    SwapDirection,
} from "../src/search/types";

import { searchPathQuery } from "../src/search/func";

export async function findSwapPath(
    tokenA: TokenInfoFormatted,
    tokenB: TokenInfoFormatted,
    amountIn: string
): Promise<any> {
    const chain: BaseChain = initialChainTable[ChainId.ZkSyncEra];
    const rpc = "https://mainnet.era.zksync.io/";
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc));

    const quoterAddress = "0x30C089574551516e5F1169C32C6D429C92bf3CD7";
    // const quoterAddress = "0x377EC7c9ae5a0787F384668788a1654249059dD6" // legacy version swap
    const ETH = {
        chainId: ChainId.ZkSyncEra,
        symbol: "ETH",
        address: "0x000000000000000000000000000000000000800A",
        decimal: 18,
    };
    const WETH = {
        chainId: ChainId.ZkSyncEra,
        symbol: "WETH",
        address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
        decimal: 18,
    };
    const USDT = {
        chainId: ChainId.ZkSyncEra,
        symbol: "USDT",
        address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
        decimal: 6
    } as TokenInfoFormatted

    const USDC = {
        chainId: ChainId.ZkSyncEra,
        symbol: "USDC",
        address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
        decimal: 6,
    };

    const iZi = {
        chainId: ChainId.ZkSyncEra,
        symbol: "iZi",
        address: "0x16A9494e257703797D747540f01683952547EE5b",
        decimal: 18,
    } as TokenInfoFormatted;

    const support001Pools = [
        {
            tokenA: iZi,
            tokenB: USDC,
            feeContractNumber: 100,
        } as PoolPair,
        {
            tokenA: USDC,
            tokenB: ETH,
            feeContractNumber: 100,
        } as PoolPair,
    ];
    const amountInput = new BigNumber(amountIn)
        .times(10 ** tokenA.decimal)
        .toFixed(0);

    const multicallAddress = "0x18d6b2F2A5F88380D42AdD6588F4484Cfb27EE07";

    const multicallContract = getMulticallContracts(multicallAddress, web3);
    const liquidityManagerAddress = "0x483FDE31bcE3DCc168E23a870831b50Ce2cCd1F1";
    // const liquidityManagerAddress = "0x936c9A1B8f88BFDbd5066ad08e5d773BC82EB15F"; // legacy version swap
    const searchParams = {
        chainId: Number(ChainId.ZkSyncEra),
        web3: web3,
        multicall: multicallContract,
        tokenIn: tokenA,
        tokenOut: tokenB,
        liquidityManagerAddress,
        quoterAddress,
        poolBlackList: [],
        midTokenList: [USDC, tokenA, tokenB, USDT, WETH, ETH],
        supportFeeContractNumbers: [2000, 400, 100],
        support001Pools,
        direction: SwapDirection.ExactIn,
        amount: amountIn,
    } as SearchPathQueryParams;

    const { pathQueryResult } = await searchPathQuery(searchParams);
    return pathQueryResult;
}

