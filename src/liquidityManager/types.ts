import { TokenInfoFormatted } from "../base/types";

export interface Liquidity {
    leftPoint: number;
    rightPoint: number;
    liquidity: string;
    lastFeeScaleX_128: string;
    lastFeeScaleY_128: string;
    remainTokenX: string;
    remainTokenY: string;
    poolId: string;
    poolAddress: string;
    tokenX: TokenInfoFormatted;
    tokenY: TokenInfoFormatted;
    fee: number;
}