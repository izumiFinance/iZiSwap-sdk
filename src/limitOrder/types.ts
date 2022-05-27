// struct LimOrder {
//     // total amount of earned token by all users at this point 
//     // with same direction (sell x or sell y) as of the last update(add/dec)
//     uint256 lastAccEarn;
//     // initial amount of token on sale
//     uint128 amount;
//     // remaing amount of token on sale
//     uint128 sellingRemain;
//     // accumulated decreased token
//     uint128 accSellingDec;
//     // uncollected decreased token
//     uint128 sellingDec;
//     // uncollected earned token
//     uint128 earn;
//     // id of pool in which this liquidity is added
//     uint128 poolId;
//     // block.timestamp when add a limit order
//     uint128 timestamp;
//     // point (price) of limit order
//     int24 pt;
//     // direction of limit order (sellx or sell y)
//     bool sellXEarnY;
//     // active or not
//     bool active;
// }

import { TokenInfoFormatted } from "../base/types";
import { BigNumber } from 'bignumber.js'

export interface LimitOrder {
    idx: string,
    lastAccEarn: string,
    amount: string,
    filled: string,
    sellingRemain: string,
    accSellingDec: string,
    earn: string,
    pending: string,
    poolId: string,
    poolAddress: string,
    tokenX: TokenInfoFormatted,
    tokenY: TokenInfoFormatted,
    createTime: Number,
    point: number,
    priceXByY: BigNumber,
    priceXByYDecimal: number,
    sellXEarnY: boolean,
    active: boolean
}

// struct AddLimOrderParam {
//     // tokenX of swap pool
//     address tokenX;
//     // tokenY of swap pool
//     address tokenY;
//     // fee amount of swap pool
//     uint24 fee;
//     // on which point to add limit order
//     int24 pt;
//     // amount of token to sell
//     uint128 amount;
//     // sell tokenX or sell tokenY
//     bool sellXEarnY;

//     uint256 deadline;
// }

export interface AddLimOrderParam {
    idx: string,
    sellToken: TokenInfoFormatted,
    earnToken: TokenInfoFormatted,
    fee: number,
    point: number,
    sellAmount: string,
    deadline?: string,
    strictERC20Token?: boolean
}

export interface CollectLimOrderParam {
    orderIdx: string,
    tokenX: TokenInfoFormatted,
    tokenY: TokenInfoFormatted,
    collectDecAmount: string,
    collectEarnAmount: string,
    recipient?: string,
    strictERC20Token?: boolean,
}