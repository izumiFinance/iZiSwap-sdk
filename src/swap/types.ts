import { TokenInfoFormatted } from "../base/types";

export interface SwapSingleWithExactInputParams {
    inputToken: TokenInfoFormatted;
    outputToken: TokenInfoFormatted;
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    fee: number;
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = inputAmount / (10 ** inputToken.decimal)
    inputAmount: string;
    minOutputAmount: string;
    recipient?: string;
    deadline?: string;
    boundaryPt?: number;
    // true if treat wrapped coin(wbnb or weth ...) as erc20 token
    strictERC20Token?: boolean;
}

export interface SwapSingleWithExactOutputParams {
    inputToken: TokenInfoFormatted;
    outputToken: TokenInfoFormatted;
    // fee / 1e6 is feeTier
    // 3000 means 0.3%
    fee: number;
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = outputAmount / (10 ** outputToken.decimal)
    outputAmount: string;
    maxInputAmount: string;
    recipient?: string;
    deadline?: string;
    boundaryPt?: number;
    // true if treat wrapped coin(wbnb or weth ...) as erc20 token
    strictERC20Token?: boolean;
}

export interface SwapChainWithExactInputParams {
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
    minOutputAmount: string;
    recipient?: string;
    deadline?: string;
    // true if treat wrapped coin(wbnb or weth ...) as erc20 token
    strictERC20Token?: boolean;
}

export interface SwapChainWithExactOutputParams {
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
    maxInputAmount: string;
    recipient?: string;
    deadline?: string;
    // true if treat wrapped coin(wbnb or weth ...) as erc20 token
    strictERC20Token?: boolean;
}