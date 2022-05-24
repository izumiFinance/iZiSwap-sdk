
/*
        // left point of liquidity-token, the range is [leftPt, rightPt)
        int24 leftPt;
        // right point of liquidity-token, the range is [leftPt, rightPt)
        int24 rightPt;
        // amount of liquidity on each point in [leftPt, rightPt)
        uint128 liquidity;
        // a 128-fixpoint number, as integral of { fee(pt, t)/L(pt, t) }. 
        // here fee(pt, t) denotes fee generated on point pt at time t
        // L(pt, t) denotes liquidity on point pt at time t
        // pt varies in [leftPt, rightPt)
        // t moves from pool created until miner last modify this liquidity-token (mint/addLiquidity/decreaseLiquidity/create)
        uint256 lastFeeScaleX_128;
        uint256 lastFeeScaleY_128;
        // remained tokenX miner can collect, including fee and withdrawed token
        uint256 remainTokenX;
        uint256 remainTokenY;
        // id of pool in which this liquidity is added
        uint128 poolId;
*/


export const liquidityParams = [
    {
        type: 'int24',
        name: 'leftPt'
    }, 
    {
        type: 'int24',
        name: 'rightPt'
    },
    {
        type: 'uint128',
        name: 'liquidity',
    },
    {
        type: 'uint256',
        name: 'lastFeeScaleX_128'
    },
    {
        type: 'uint256',
        name: 'lastFeeScaleY_128'
    },
    {
        type: 'uint256',
        name: 'remainTokenX',
    },
    {
        type: 'uint256',
        name: 'remainTokenY',
    },
    {
        type: 'uint128',
        name: 'poolId'
    },
]

export interface LiquidityRawParams {
    leftPt: number,
    rightPt: number,
    liquidity: any,
    lastFeeScaleX_128: any,
    lastFeeScaleY_128: any,
    remainTokenX: any,
    remainTokenY: any,
    poolId: any
}

// struct PoolMeta {
//     // tokenX of pool
//     address tokenX;
//     // tokenY of pool
//     address tokenY;
//     // fee amount of pool
//     uint24 fee;
// }

export const poolMetas = [
    {
        type: 'address',
        name: 'tokenX'
    }, 
    {
        type: 'address',
        name: 'tokenY'
    },
    {
        type: 'uint24',
        name: 'fee',
    },
]