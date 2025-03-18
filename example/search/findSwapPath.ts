import {ChainId, TokenInfoFormatted} from "../../src/base";
import {BigNumber} from "bignumber.js";
import {findSwapPath} from "../../function/findSwapPath";

const MAV = {
    chainId: ChainId.ZkSyncEra,
    symbol: "MAV",
    address: "0x787c09494ec8bcb24dcaf8659e7d5d69979ee508",
    decimal: 18,
} as TokenInfoFormatted;
const iZi = {
    chainId: ChainId.ZkSyncEra,
    symbol: "iZi",
    address: "0x16A9494e257703797D747540f01683952547EE5b",
    decimal: 18,
} as TokenInfoFormatted;
const SPACE = {
    chainId: ChainId.ZkSyncEra,
    symbol: "SPACE",
    address: "0x47260090cE5e83454d5f05A0AbbB2C953835f777",
    decimal: 18
} as TokenInfoFormatted
const USDC = {
    chainId: ChainId.ZkSyncEra,
    symbol: "USDC",
    address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    decimal: 6
} as TokenInfoFormatted
async function run(tokenA: TokenInfoFormatted, tokenB: TokenInfoFormatted, AmountIn: string) {
    const pathQueryResult = await findSwapPath(tokenA, tokenB, new BigNumber(AmountIn).times(10 ** tokenA.decimal).toFixed(0));
    console.log('output amount: ', pathQueryResult.amount)
    // print path info
    // which can be filled to swap params
    // see example of "example/quoterAndSwap/"
    console.log('fee chain: ', pathQueryResult.path.feeContractNumber)
    console.log('token chain: ', pathQueryResult.path.tokenChain)

    // print other info
    console.log('price impact: ', pathQueryResult.priceImpact)
    console.log('init price of endToken by startToken', pathQueryResult.initDecimalPriceEndByStart)
    console.log('fee cost (decimal amount): ', pathQueryResult.feesDecimal)
}

run(MAV, iZi, "1").catch(error => console.error(error));
