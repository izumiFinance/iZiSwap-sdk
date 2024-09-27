import { TokenInfoFormatted } from "../base/types"
import { Contract } from 'web3-eth-contract'
import Web3, { ContractAbi } from "web3";

export interface DagNode {
    
    // all elements of preIdx should be strictly smaller than current node idx!
    preIdx?: number[]

    calling?: string
    targetAddress?: string

    // if preIdx is not undefined and its' length > 0,
    // after get and parse response of pre nodes, controller will call 'getCallingAndTargetAddress'
    // to get calling and targetAddress of this node
    getCallingAndTargetAddress?: () => {targetAddress: string, calling: string}

    // when get response of calling, the controller will call 'parseCallingResponse'
    // to parse the response
    parseCallingResponse: (response: string) => void
}

export enum SwapDirection {
    ExactIn = 'ExactIn',
    ExactOut = 'ExactOut'
}

export enum CallingProperty {
    Long = 'long',
    Short = 'short'
}

export interface Path {
    tokenChain: TokenInfoFormatted[]
    feeContractNumber: number[]
}

export interface PathQueryCalling {
    calling: string
    targetAddress: string
    callingProperty?: CallingProperty
}

export interface PathQueryResult {
    // computed amount (amountIn for desire mode and amountOut otherwise)
    amount: string
    path: Path
    noSufficientLiquidity: boolean
    initDecimalPriceEndByStart: number
    priceImpact: number
    feesDecimal: number
    feeRate: number
}

export interface PathQuery {
    path: Path
    // if pathQueryResult is undefined, 
    // our plugin should provide pathQueryCalling
    pathQueryCalling?: PathQueryCalling
    pathQueryResult?: PathQueryResult
}

export interface PreQueryResult {
    lastChainId?: number
    pathWithOutFee100: Path[]
    pathWithFee100: Path[]
    pool: Map<string, string>
    poolPoint: Map<string, number>
}

export const initiZiPreResult = (chainId: number): PreQueryResult => {
    return {
        lastChainId: chainId,
        pathWithFee100: [] as Path[],
        pathWithOutFee100: [] as Path[],
        pool: new Map<string, string>(),
        poolPoint: new Map<string, number>()
    } as PreQueryResult
}

export interface PoolPair {
    tokenA: TokenInfoFormatted
    tokenB: TokenInfoFormatted
    feeContractNumber: number
}

export interface PreQueryParams {
    chainId: number,
    web3: Web3,
    multicall: Contract<ContractAbi>,
    tokenIn: TokenInfoFormatted,
    tokenOut: TokenInfoFormatted,
    liquidityManagerAddress: string,
    poolBlackList: PoolPair[],
    midTokenList: TokenInfoFormatted[],
    supportFeeContractNumbers: number[],
    support001Pools: PoolPair[],
}

export interface PathQueryParams {
    chainId: number,
    quoterAddress: string,
    web3: Web3,
    multicall: Contract<ContractAbi>,
    tokenIn: TokenInfoFormatted,
    tokenOut: TokenInfoFormatted,
    direction: SwapDirection,
    amount: string,
    longBatchSize: number,
    shortBatchSize: number
}

export interface SearchPathQueryParams {

    chainId: number,
    web3: Web3,
    multicall: Contract<ContractAbi>,
    tokenIn: TokenInfoFormatted,
    tokenOut: TokenInfoFormatted,
    liquidityManagerAddress: string,
    quoterAddress: string,
    poolBlackList: PoolPair[],
    midTokenList: TokenInfoFormatted[],
    supportFeeContractNumbers: number[],
    support001Pools: PoolPair[],
    direction: SwapDirection,
    amount: string,
    longBatchSize?: number,
    shortBatchSize?: number,
}