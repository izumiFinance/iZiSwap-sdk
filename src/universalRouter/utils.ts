import { getTokenChainPath, TokenInfoFormatted } from "../base";

export const outFeeTier2OutFeeContractNumber = (outFeeRate: number) => {
    return outFeeRate * 100;
}

export const getUniversalHexPath = (feeTier: number[], isV2: boolean[], tokenChain: TokenInfoFormatted[]) => {
    const feeChain: number[] = [];
    for (let idx = 0; idx < isV2.length; idx ++) {
        if (isV2[idx]) {
            feeChain.push(0);
        } else {
            feeChain.push(feeTier[idx] * 1e6 / 100)
        }
    }
    const path = getTokenChainPath(tokenChain, feeChain)
    return path;
}