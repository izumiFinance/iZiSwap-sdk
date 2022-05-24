import { TokenInfoFormatted } from "../base/types";
import { State } from "../pool/types";


export interface Liquidity {
    leftPoint: number;
    rightPoint: number;
    liquidity: string;
    lastFeeScaleX_128: string;
    lastFeeScaleY_128: string;
    remainTokenX: string;
    remainTokenY: string;
    amountX: string;
    amountY: string;
    poolId: string;
    poolAddress: string;
    tokenX: TokenInfoFormatted;
    tokenY: TokenInfoFormatted;
    fee: number;
    state: State;
}

/* 


        // miner address
        address miner;
        // tokenX of swap pool
        address tokenX;
        // tokenY of swap pool
        address tokenY;
        // fee amount of swap pool
        uint24 fee;
        // left point of added liquidity
        int24 pl;
        // right point of added liquidity
        int24 pr;
        // amount limit of tokenX miner willing to deposit
        uint128 xLim;
        // amount limit tokenY miner willing to deposit
        uint128 yLim;
        // minimum amount of tokenX miner willing to deposit
        uint128 amountXMin;
        // minimum amount of tokenY miner willing to deposit
        uint128 amountYMin;

        uint256 deadline;
*/
export interface MintParam {
    recipient: string;
    tokenA: TokenInfoFormatted;
    tokenB: TokenInfoFormatted;
    fee: number;
    leftPoint: number;
    rightPoint: number;
    maxAmountA: string;
    maxAmountB: string;
    minAmountA: string;
    minAmountB: string;
    deadline?: string;
    strictERC20Token?: boolean;
}

/*

    /// parameters when calling addLiquidity, grouped together to avoid stake too deep
    struct AddLiquidityParam {
        // id of nft
        uint256 lid;
        // amount limit of tokenX user willing to deposit
        uint128 xLim;
        // amount limit of tokenY user willing to deposit
        uint128 yLim;
        // min amount of tokenX user willing to deposit
        uint128 amountXMin;
        // min amount of tokenY user willing to deposit
        uint128 amountYMin;

        uint256 deadline;
    }
*/


export interface AddLiquidityParam {
    tokenId: string;
    tokenA: TokenInfoFormatted;
    tokenB: TokenInfoFormatted;
    maxAmountA: string;
    maxAmountB: string;
    minAmountA: string;
    minAmountB: string;
    deadline?: string;
    strictERC20Token?: boolean;
}

export interface DecLiquidityParam {
    tokenId: string;
    liquidDelta: string;
    minAmountX: string;
    minAmountY: string;
    deadline?: string;
}