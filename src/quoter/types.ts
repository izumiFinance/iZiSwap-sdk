import { TokenInfoFormatted } from "../base/types";

export interface QuoterSwapSingleWithExactInputParams {
    inputToken: TokenInfoFormatted;
    outputToken: TokenInfoFormatted;
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    fee: number;
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = inputAmount / (10 ** inputToken.decimal)
    inputAmount: string;
    boundaryPt?: number;
}

export interface QuoterSwapSingleWithExactOutputParams {
    inputToken: TokenInfoFormatted;
    outputToken: TokenInfoFormatted;
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    fee: number;
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = outputAmount / (10 ** outputToken.decimal)
    outputAmount: string;
    boundaryPt?: number;
}

export interface QuoterSwapChainWithExactInputParams {
    // input: tokenChain[0]
    // output: tokenChain[1]
    tokenChain: TokenInfoFormatted[];
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    feeChain: number[];
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = inputAmount / (10 ** inputToken.decimal)
    inputAmount: string;
}

export interface QuoterSwapChainWithExactOutputParams {
    // input: tokenChain[0]
    // output: tokenChain[1]
    tokenChain: TokenInfoFormatted[];
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    feeChain: number[];
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = outputAmount / (10 ** outputToken.decimal)
    outputAmount: string;
}