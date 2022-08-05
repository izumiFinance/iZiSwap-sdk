import { TokenInfoFormatted } from "../base"

export interface MintParams {
    recipient?: string
    tokenA: TokenInfoFormatted
    tokenB: TokenInfoFormatted
    // 2000 for 0.2%
    fee: number
    leftPoint: number
    rightPoint: number
    maxAmountA: string
    maxAmountB: string
    minAmountA: string
    minAmountB: string
    deadline?: string
}

export interface AddLiquidityParams {
    tokenId: string
    tokenA: TokenInfoFormatted
    tokenB: TokenInfoFormatted
    maxAmountA: string
    maxAmountB: string
    minAmountA: string
    minAmountB: string
    deadline?: string
}

export interface DecLiquidityAndCollectParams {
    tokenId: string
    tokenA: TokenInfoFormatted
    tokenB: TokenInfoFormatted
    liquidDelta: string
    minAmountA: string
    minAmountB: string
    deadline?: string
    recipient?: string
}

export interface CollectLiquidityParams {
    tokenId: string
    tokenA: TokenInfoFormatted
    tokenB: TokenInfoFormatted
    maxAmountA: string
    maxAmountB: string
    recipient?: string
}

export interface SwapChainWithExactInputParams {
    // input: tokenChain[0]
    // output: tokenChain[1]
    tokenChain: TokenInfoFormatted[];
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    feeChain: number[];
    // 10-decimal format integer number, like 100, 150000, ...
    // or hex format number start with '0x'
    // decimal amount = inputAmount / (10 ** inputToken.decimal)
    inputAmount: string;
    minOutputAmount: string;
    recipient?: string
    deadline?: string
}