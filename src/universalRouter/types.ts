import { TokenInfoFormatted } from "../base";

export interface UniversalPoolPrice {
    // true for V2Pool
    // false for V3Pool
    isV2: boolean;

    // only for V3Pool, etc isV2 == false
    point?: number; 

    // following fields only for V2Pool
    //     etc isV2 == true
    reserve0?: string;
    reserve1?: string;
    reserveIn?: string;
    reserveOut?: string;
}

export interface SwapExactInputParams {
    // input: tokenChain.first()
    // output: tokenChain.last()
    tokenChain: TokenInfoFormatted[];
    // fee percent of pool(tokenChain[i], tokenChain[i+1]) 0.3 means 0.3%
    //     only need for V3Pool
    //     for V2Pool, you can fill arbitrary value
    feeTier: number[];
    // isV2[i] == true, means pool(tokenChain[i], tokenChain[i+1]) is a V2Pool
    // otherwise, the corresponding pool is V3Pool
    //     same length as feeTier
    isV2: boolean[];
    // 10-decimal format integer number, like 100, 150000, ...
    // or hex format number start with '0x'
    // decimal amount = inputAmount / (10 ** inputToken.decimal)
    inputAmount: string;
    minOutputAmount: string;
    // outChargeFeeTier% of trader's acquired token (outToken) 
    // will be additionally charged by universalRouter
    // if outChargeFeeTier is 0.2, 0.2% of outToken will be additionally charged
    // if outChargeFeeTier is 0, no outToken will be additionally charged
    // outChargeFeeTier should not be greater than 5 (etc, 5%)
    outChargeFeeTier: number;
    recipient?: string;
    deadline?: string;
}

export interface SwapExactOutputParams {
    // input: tokenChain.first()
    // output: tokenChain.last()
    tokenChain: TokenInfoFormatted[];
    // fee percent of pool(tokenChain[i], tokenChain[i+1]) 0.3 means 0.3%
    //     only need for V3Pool
    //     for V2Pool, you can fill arbitrary value
    feeTier: number[];
    // isV2[i] == true, means pool(tokenChain[i], tokenChain[i+1]) is a V2Pool
    // otherwise, the corresponding pool is V3Pool
    //     same length as feeTier
    isV2: boolean[];
    // 10-decimal format number, like 100, 150000, ...
    // or hex format number start with '0x'
    // amount = outputAmount / (10 ** outputToken.decimal)
    outputAmount: string;
    maxInputAmount: string;
    // outChargeFeeTier% of trader's acquired token (outToken) 
    // will be additionally charged by universalRouter
    // if outChargeFeeTier is 0.2, 0.2% of outToken will be additionally charged
    // if outChargeFeeTier is 0, no outToken will be additionally charged
    // outChargeFeeTier should not be greater than 5 (etc, 5%)
    outChargeFeeTier: number;
    recipient?: string;
    deadline?: string;
}