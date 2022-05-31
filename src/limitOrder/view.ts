import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { fetchToken } from "../base/token/token"
import { BaseChain, TokenInfoFormatted } from "../base/types"
import { decodeMethodResult, getEVMContract } from "../base/utils"
import { poolMetas } from "../liquidityManager/library/decodeParams"
import limitOrderAbi from './abi.json'
import { LimitOrder } from "./types"
import { BigNumber } from 'bignumber.js'
import { point2PriceUndecimal, priceUndecimal2PriceDecimal } from "../base/price"

export const getLimitOrderManagerContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(limitOrderAbi, address, web3)
}

export const getPoolAddress = async (
    limitOrderManager: Contract, 
    tokenA: TokenInfoFormatted, 
    tokenB: TokenInfoFormatted, 
    fee: number) : Promise<string> => {
    const poolAddress = await limitOrderManager.methods.pool(tokenA.address, tokenB.address, fee).call()
    return poolAddress
}

export const fetchLimitOrderOfAccount = async(
    chain: BaseChain,
    web3: Web3,
    limitOrderManager: Contract,
    account: string,
    tokenList: TokenInfoFormatted[]
): Promise< { activeOrders: LimitOrder[], deactiveOrders: LimitOrder[] }> => {

    // 1. get active limit order id
    const limitOrderMulticallData = [];
    limitOrderMulticallData.push(limitOrderManager.methods.getActiveOrders(account).encodeABI());
    limitOrderMulticallData.push(limitOrderManager.methods.getDeactiveOrders(account).encodeABI());
    const limitOrderListResult: string[] = await limitOrderManager.methods.multicall(limitOrderMulticallData).call();

    const getActiveOrderResult = decodeMethodResult(limitOrderManager, 'getActiveOrders', limitOrderListResult[0])
    const getDeactiveOrderResult = decodeMethodResult(limitOrderManager, 'getDeactiveOrders', limitOrderListResult[1])
    const activeOrderIdx = getActiveOrderResult.activeIdx
    const activeLimitOrder = getActiveOrderResult.activeLimitOrder
    const deactiveLimitOrder = getDeactiveOrderResult
    const allOrders = [...activeLimitOrder, ...deactiveLimitOrder];
    if (allOrders.length <= 0) { return {activeOrders:[], deactiveOrders:[]}; }

    const orderTotal = allOrders.length;
    const activeOrderTotal = activeOrderIdx.length;
    // const deactiveOrderTotal = deactiveLimitOrder.length;

    // 2. get limit order detail
    const poolMetaMulticallData = allOrders.map(order => limitOrderManager.methods.poolMetas(order.poolId).encodeABI());
    const poolAddrMulticallData = allOrders.map(order => limitOrderManager.methods.poolAddrs(order.poolId).encodeABI());
    const poolResult: string[] = await limitOrderManager.methods.multicall([...poolMetaMulticallData, ...poolAddrMulticallData]).call();
    const poolMetaList = poolResult.slice(0, orderTotal).map(p => web3.eth.abi.decodeParameters(poolMetas, p));
    const poolAddressList = poolResult.slice(orderTotal, orderTotal * 2).map(p => String(web3.eth.abi.decodeParameter('address', p)));

    const updateOrderMulticallData = activeOrderIdx.map((idx: string) => limitOrderManager.methods.updateOrder(idx).encodeABI());

    const updateOrderResult: string[] = await limitOrderManager.methods.multicall(updateOrderMulticallData).call({from: account})

    const activeOrders: LimitOrder[] = []
    const deactiveOrders: LimitOrder[] = []

    for (let i = 0; i < orderTotal; i ++) {
        const orderPoolMeta = poolMetaList[i]
        let tokenX = { ...tokenList.find((e) => e.address.toLowerCase() === orderPoolMeta.tokenX.toLowerCase()) } as TokenInfoFormatted;
        let tokenY = { ...tokenList.find((e) => e.address.toLowerCase() === orderPoolMeta.tokenY.toLowerCase()) } as TokenInfoFormatted;
        if (!tokenX.symbol) {
            tokenX = await fetchToken(orderPoolMeta.tokenX, chain, web3)
        }
        if (!tokenY.symbol) {
            tokenY = await fetchToken(orderPoolMeta.tokenY, chain, web3)
        }
        if (i < activeOrderTotal) {
            const earn: string = activeLimitOrder[i].earn
            const updateEarn: string = decodeMethodResult(limitOrderManager, 'updateOrder', updateOrderResult[i])
            const pending = new BigNumber(updateEarn).minus(earn).toFixed(0)

            const sellingRemain: string = activeLimitOrder[i].sellingRemain
            const accSellingDec: string = activeLimitOrder[i].accSellingDec
            const sellingDec: string = activeLimitOrder[i].sellingDec
            const amount: string = activeLimitOrder[i].amount

            const filled = new BigNumber(amount).minus(sellingRemain).minus(accSellingDec).toFixed(0)
            const point = Number(activeLimitOrder[i].pt)
            const priceXByY = point2PriceUndecimal(tokenX, tokenY, point)
            const priceXByYDecimal = priceUndecimal2PriceDecimal(tokenX, tokenY, priceXByY)
            const idx: string = activeOrderIdx[i]
            const lastAccEarn: string = activeLimitOrder[i].lastAccEarn
            const poolId: string = activeLimitOrder[i].poolId
            const poolAddress: string = poolAddressList[i]
            const limitOrder = {
                idx,
                lastAccEarn,
                amount,
                filled,
                sellingRemain,
                accSellingDec,
                sellingDec,
                earn,
                pending,
                poolId,
                poolAddress,
                tokenX,
                tokenY,
                createTime: Number(activeLimitOrder[i].timestamp),
                point,
                priceXByY,
                priceXByYDecimal,
                sellXEarnY: activeLimitOrder[i].sellXEarnY,
                active: true
            } as LimitOrder
            activeOrders.push(limitOrder)
        } else {
            const ii = i - activeOrderTotal
            const earn: string = deactiveLimitOrder[ii].earn
            const pending = '0'

            const sellingRemain: string = deactiveLimitOrder[ii].sellingRemain
            const accSellingDec: string = deactiveLimitOrder[ii].accSellingDec
            const sellingDec: string = deactiveLimitOrder[ii].sellingDec
            const amount: string = deactiveLimitOrder[ii].amount

            const filled = new BigNumber(amount).minus(sellingRemain).minus(accSellingDec).toFixed(0)
            const point = Number(deactiveLimitOrder[ii].pt)
            const priceXByY = point2PriceUndecimal(tokenX, tokenY, point)
            const priceXByYDecimal = priceUndecimal2PriceDecimal(tokenX, tokenY, priceXByY)
            const idx = '-1'
            const lastAccEarn: string = deactiveLimitOrder[ii].lastAccEarn
            const poolId: string = deactiveLimitOrder[ii].poolId
            const poolAddress: string = poolAddressList[ii]
            const limitOrder = {
                idx,
                lastAccEarn,
                amount,
                filled,
                sellingRemain,
                accSellingDec,
                sellingDec,
                earn,
                pending,
                poolId,
                poolAddress,
                tokenX,
                tokenY,
                createTime: Number(deactiveLimitOrder[ii].timestamp),
                point,
                priceXByY,
                priceXByYDecimal,
                sellXEarnY: deactiveLimitOrder[ii].sellXEarnY,
                active: false
            } as LimitOrder
            deactiveOrders.push(limitOrder)
        }
    }
    return {activeOrders, deactiveOrders}
}

export const getDeactiveSlot = async(
    limitOrderManager: Contract,
    account: string
): Promise<string> => {
    return (await limitOrderManager.methods.getDeactiveSlot(account).call()).toString()
}