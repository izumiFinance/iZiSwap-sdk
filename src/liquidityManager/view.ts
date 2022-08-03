import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { getEVMContract, parallelCollect } from "../base/utils"
import liquidityManagerAbi from './abi.json'

import { BigNumber } from 'bignumber.js'
import { BaseChain, TokenInfoFormatted } from "../base/types"
import { 
    _getAmountX,
    _getAmountY,
    _liquidity2AmountXAtPoint,
    _liquidity2AmountYAtPoint,
    _calciZiLiquidityAmountY, 
    _calciZiLiquidityAmountX 
} from './library/amountMath'
import { Liquidity } from "./types"
import { point2PoolPriceUndecimalSqrt } from "../base/price"
import { BaseState, State } from "../pool/types"
import { amount2Decimal, fetchToken, getSwapTokenAddress } from "../base"
import { liquidityParams, poolMetas, LiquidityRawParams } from "./library/decodeParams"
import { getPoolContract, getPoolState } from "../pool/funcs"
import { getLiquidityValue } from "./calc"

export const getLiquidityManagerContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(liquidityManagerAbi, address, web3);
}


export const getPoolAddress = async (
    liquidityManagerContract: Contract, 
    tokenA: TokenInfoFormatted, 
    tokenB: TokenInfoFormatted, 
    fee: number) : Promise<string> => {
    const poolAddress = await liquidityManagerContract.methods.pool(
        getSwapTokenAddress(tokenA), 
        getSwapTokenAddress(tokenB), 
        fee
    ).call()
    return poolAddress
}


export const fetchLiquiditiesByTokenIds = async (
    chain: BaseChain, 
    web3: Web3, 
    liquidityManagerContract: Contract,
    tokenIdList: string[],
    tokenList: TokenInfoFormatted[]
): Promise<Liquidity[]> => {

    // 3. get all liquidities data by tokenId list
    const liquidityMulticallData = tokenIdList.map(tokId => liquidityManagerContract.methods.liquidities(tokId).encodeABI());
    const refreshLiquidityMulticallData = tokenIdList.map(tokId => liquidityManagerContract.methods.decLiquidity(tokId, '0', '0', '0', '0xffffffff').encodeABI());
    const liquidityResult: string[] = await liquidityManagerContract.methods.multicall([...refreshLiquidityMulticallData, ...liquidityMulticallData]).call();
    const liquidities: Liquidity[] = liquidityResult.slice(refreshLiquidityMulticallData.length, liquidityResult.length).map((l, i) => {
        const liquidityRaw = web3.eth.abi.decodeParameters(liquidityParams, l) as LiquidityRawParams;
        const liquidity = {
            tokenId: tokenIdList[i],
            leftPoint: Number(liquidityRaw.leftPt),
            rightPoint: Number(liquidityRaw.rightPt),
            liquidity: liquidityRaw.liquidity.toString(),
            lastFeeScaleX_128: liquidityRaw.lastFeeScaleX_128.toString(),
            lastFeeScaleY_128: liquidityRaw.lastFeeScaleY_128.toString(),
            remainTokenX: liquidityRaw.remainTokenX.toString(),
            remainTokenY: liquidityRaw.remainTokenY.toString(),
            poolId: liquidityRaw.poolId.toString()
        } as Liquidity;
        return liquidity;
    });

    // 4. get liquidity meta data by poolId
    const metaMulticallData = liquidities.map(({ poolId }) => liquidityManagerContract.methods.poolMetas(poolId).encodeABI());
    const metaResult: string[] = await liquidityManagerContract.methods.multicall(metaMulticallData).call();

    for (let i = 0; i < metaResult.length; i++) {
        const m = metaResult[i];
        const poolMetaRaw = web3.eth.abi.decodeParameters(poolMetas, m);
        const tokenXAddress = poolMetaRaw.tokenX;
        const tokenYAddress = poolMetaRaw.tokenY;
        const fee = poolMetaRaw.fee;
        liquidities[i] = { ...liquidities[i], fee };
        liquidities[i].tokenX = { ...tokenList.find((e) => getSwapTokenAddress(e).toUpperCase() === tokenXAddress.toUpperCase()) } as unknown as any;
        liquidities[i].tokenY = { ...tokenList.find((e) => getSwapTokenAddress(e).toUpperCase() === tokenYAddress.toUpperCase()) } as unknown as any;
        if (!liquidities[i].tokenX.symbol) {
            liquidities[i].tokenX = await fetchToken(tokenXAddress, chain, web3)
        }
        if (!liquidities[i].tokenY.symbol) {
            liquidities[i].tokenY = await fetchToken(tokenYAddress, chain, web3)
        }
    }

    // TODO set main data first, price later, same farm
    // 5. get pool address
    const poolAddressMulticallData = liquidities.map((l) => liquidityManagerContract.methods.pool(
        getSwapTokenAddress(l.tokenX), 
        getSwapTokenAddress(l.tokenY), 
        l.fee
    ).encodeABI());
    const poolAddressResult: string[] = await liquidityManagerContract.methods.multicall(poolAddressMulticallData).call();
    const poolAddressList = poolAddressResult.map(r => String(web3.eth.abi.decodeParameter('address', r)));

    // 6. get current price from pool
    const stateResultList = await parallelCollect(...poolAddressList.map(poolAddr => getPoolState(getPoolContract(poolAddr, web3))));
    stateResultList.forEach((value: any, i) => {
        const r: State = value
        liquidities[i].poolAddress = poolAddressList[i]
        liquidities[i].state = r
    })

    // 7. pure function calculate data
    for (const liquidity of liquidities) {

        const { amountX, amountY} = getLiquidityValue(liquidity, liquidity.state);
        liquidity.amountX = amountX.toFixed(0)
        liquidity.amountY = amountY.toFixed(0)
    }

    return liquidities
}

export const fetchLiquiditiesOfAccount = async (
    chain: BaseChain, 
    web3: Web3, 
    liquidityManagerContract: Contract, 
    account: string, 
    tokenList: TokenInfoFormatted[]
): Promise<Liquidity[]> => {

    // 1. get total nft by account
    const tokenTotal = await liquidityManagerContract.methods.balanceOf(account).call().then((balance: string) => Number(balance));
    if (tokenTotal <= 0) { 
        return []
    }

    // 2. get tokenId list by total nft
    const tokenIdMulticallData = [];
    for (let i = 0; i < tokenTotal; i++) {
        tokenIdMulticallData.push(liquidityManagerContract.methods.tokenOfOwnerByIndex(account, i.toString()).encodeABI());
    }
    const tokenIdListResult: string[] = await liquidityManagerContract.methods.multicall(tokenIdMulticallData).call();
    const tokenIdList: string[] = tokenIdListResult.map((tokId: string) => new BigNumber(tokId).toFixed(0));

    return await fetchLiquiditiesByTokenIds(chain, web3, liquidityManagerContract, tokenIdList, tokenList)
}