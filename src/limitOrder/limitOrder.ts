import { Contract } from 'web3-eth-contract'
import { PromiEvent } from 'web3-core';
import { BaseChain, buildSendingParams } from '../base/types'
import { AddLimOrderParam, CollectLimOrderParam } from './types'

const getNewLimOrderCall = (
    limitOrderManager: Contract,
    account: string,
    chain: BaseChain,
    params: AddLimOrderParam,
    gasPrice: number | string,
    gasLimit?: number | string
): {newLimOrderCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'

    let tokenXAddress = params.sellToken.address.toLowerCase()
    let tokenYAddress = params.earnToken.address.toLowerCase()
    let sellXEarnY = true
    if (tokenXAddress > tokenXAddress) {
        sellXEarnY = false
        let tmp = tokenYAddress
        tokenYAddress = tokenXAddress
        tokenXAddress = tmp
    }
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }
    if (!strictERC20Token) {
        if (chain.tokenSymbol === params.sellToken.symbol) {
            options.value = params.sellAmount
        }
    }
    const callings = []
    const newLimOrderCalling = limitOrderManager.methods.newLimOrder(
        params.idx,
        {
            tokenX: tokenXAddress,
            tokenY: tokenYAddress,
            fee: params.fee,
            pt: params.point,
            amount: params.sellAmount,
            sellXEarnY,
            deadline
        }
    )
    callings.push(newLimOrderCalling)
    if (options.value !== '0') {
        callings.push(limitOrderManager.methods.refundETH())
    }
    if (callings.length === 1) {
        return {newLimOrderCalling: callings[0], options}
    }
    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {newLimOrderCalling: multicall, options}
}

export const newLimOrderEstimateGas = async(
    limitOrderContract: Contract,
    account: string,
    chain: BaseChain,
    params: AddLimOrderParam,
    gasPrice: string | number
) : Promise<number> => {
    const {newLimOrderCalling, options} = getNewLimOrderCall(limitOrderContract, account, chain, params, gasPrice)
    return newLimOrderCalling.estimateGas(buildSendingParams(chain, options, gasPrice))
}

export const newLimOrder = (
    limitOrderContract: Contract,
    account: string,
    chain: BaseChain,
    params: AddLimOrderParam,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any> => {
    const {newLimOrderCalling, options} = getNewLimOrderCall(limitOrderContract, account, chain, params, gasPrice, gasLimit)
    return newLimOrderCalling.send(buildSendingParams(chain, options, gasPrice))
}

export const updateOrderEstimateGas = async(
    limitOrderManager: Contract,
    idx: string,
    account: string,
    chain: BaseChain,
    gasPrice: string | number
) : Promise<number> => {
    const options = {
        from: account,
        maxFeePerGas: gasPrice,
    }
    const updateOrderCalling = limitOrderManager.methods.updateOrder(idx)
    return updateOrderCalling.estimateGas(buildSendingParams(chain, options, gasPrice))
}

export const updateOrder = (
    limitOrderManager: Contract,
    idx: string,
    account: string,
    chain: BaseChain,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any> => {
    const options = {
        from: account,
        maxFeePerGas: gasPrice,
        gas: gasLimit
    }
    const updateOrderCalling = limitOrderManager.methods.updateOrder(idx)
    return updateOrderCalling.send(buildSendingParams(chain, options, gasPrice))
}

export const decLimOrderEstimateGas = async(
    limitOrderManager: Contract,
    orderIdx: string,
    decAmount: string,
    deadline: string,
    account: string,
    chain: BaseChain,
    gasPrice: string | number
) : Promise<number> => {
    const options = {
        from: account,
        maxFeePerGas: gasPrice,
    }
    const decLimOrderCalling = limitOrderManager.methods.decLimOrder(orderIdx, decAmount, deadline)
    return decLimOrderCalling.estimateGas(buildSendingParams(chain, options, gasPrice))
}

export const decLimOrder = (
    limitOrderManager: Contract,
    orderIdx: string,
    decAmount: string,
    deadline: string,
    account: string,
    chain: BaseChain,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any> => {
    const options = {
        from: account,
        maxFeePerGas: gasPrice,
        gas: gasLimit
    }
    const decLimOrderCalling = limitOrderManager.methods.decLimOrder(orderIdx, decAmount, deadline)
    return decLimOrderCalling.send(buildSendingParams(chain, options, gasPrice))
}


const getCollectLimitOrderCall = (
    limitOrderManager: Contract, 
    account: string,
    chain: BaseChain,
    params: CollectLimOrderParam, 
    gasPrice: number | string,
    gasLimit?: number | string
) : {collectLimitOrderCalling: any, options: any} => {
    const strictERC20Token = params.strictERC20Token ?? false

    const options = {
        from: account,
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }

    const outputIsChainCoin = (!strictERC20Token && (chain.tokenSymbol === params.tokenX.symbol || chain.tokenSymbol === params.tokenY.symbol));
    
    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress;
    const callings = []

    const collectCalling = limitOrderManager.methods.collect(
        innerRecipientAddress,
        params.orderIdx,
        params.collectDecAmount,
        params.collectEarnAmount
    )

    callings.push(collectCalling)
    if (outputIsChainCoin) {
        callings.push(limitOrderManager.methods.unwrapWETH9('0', finalRecipientAddress))
        let sweepTokenAddress = params.tokenX.address
        if (chain.tokenSymbol === params.tokenX.symbol) {
            sweepTokenAddress = params.tokenY.address
        }
        callings.push(limitOrderManager.methods.sweepToken(sweepTokenAddress, '0', finalRecipientAddress))
    }
    
    if (callings.length === 1) {
        return {collectLimitOrderCalling: callings[0], options}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {collectLimitOrderCalling: limitOrderManager.methods.multicall(multicall), options}
}

export const collectLimitOrderEstimateGas = async(
    limitOrderManager: Contract,
    account: string,
    chain: BaseChain,
    params: CollectLimOrderParam, 
    gasPrice: number | string
) : Promise<number> => {
    const {collectLimitOrderCalling, options} = getCollectLimitOrderCall(
        limitOrderManager, account, chain, params, gasPrice
    )
    return collectLimitOrderCalling.estimateGas(
        buildSendingParams(chain, options, gasPrice)
    )
}

export const collectLiquidity = async(
    limitOrderManager: Contract,
    account: string,
    chain: BaseChain,
    params: CollectLimOrderParam, 
    gasPrice: number | string,
    gasLimit: string | number
) : Promise<number> => {
    const {collectLimitOrderCalling, options} = getCollectLimitOrderCall(
        limitOrderManager, account, chain, params, gasPrice, gasLimit
    )
    return collectLimitOrderCalling.send(
        buildSendingParams(chain, options, gasPrice)
    )
}