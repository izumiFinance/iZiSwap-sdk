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