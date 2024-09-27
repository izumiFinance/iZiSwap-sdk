import { Contract } from 'web3-eth-contract'
import { getSwapTokenAddress, isGasOrWrappedGasToken, isGasToken } from '../base/token'
import { BaseChain, buildSendingParams } from '../base/types'
import { AddLimOrderParam, CollectLimOrderParam } from './types'
import { ContractAbi } from 'web3'

export const getNewLimOrderCall = (
    limitOrderManager: Contract<ContractAbi>,
    account: string,
    chain: BaseChain,
    params: AddLimOrderParam,
    gasPrice: number | string
): {newLimOrderCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'

    let tokenXAddress = getSwapTokenAddress(params.sellToken).toLowerCase()
    let tokenYAddress = getSwapTokenAddress(params.earnToken).toLowerCase()
    let sellXEarnY = true
    if (tokenXAddress > tokenYAddress) {
        sellXEarnY = false
        let tmp = tokenYAddress
        tokenYAddress = tokenXAddress
        tokenXAddress = tmp
    }
    const strictERC20Token = params.strictERC20Token
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    if (strictERC20Token == undefined) {
        if (isGasToken(params.sellToken, chain.id)) {
            options.value = params.sellAmount
        }
    } else if (!strictERC20Token) {
        if (isGasOrWrappedGasToken(params.sellToken, chain.id)) {
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
        return {newLimOrderCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }
    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    const newMulticall = limitOrderManager.methods.multicall(multicall)
    return {newLimOrderCalling: newMulticall, options: buildSendingParams(chain, options, gasPrice)}
}

export const getUpdateOrderCall = (
    limitOrderManager: Contract<ContractAbi>,
    idx: string,
    account: string,
    chain: BaseChain,
    gasPrice: string | number
) : {updateOrderCalling: any, options: any} => {
    const options = {
        from: account,
        maxFeePerGas: gasPrice,
    }
    const updateOrderCalling = limitOrderManager.methods.updateOrder(idx)
    return {
        updateOrderCalling,
        options: buildSendingParams(chain, options, gasPrice)
    }
}

export const getDecLimOrderCall = (
    limitOrderManager: Contract<ContractAbi>,
    orderIdx: string,
    decAmount: string,
    deadline: string,
    account: string,
    chain: BaseChain,
    gasPrice: string | number
) : {decLimOrderCalling: any, options: any} => {
    const options = {
        from: account,
        maxFeePerGas: gasPrice,
    }
    const decLimOrderCalling = limitOrderManager.methods.decLimOrder(orderIdx, decAmount, deadline)
    return { decLimOrderCalling, options: buildSendingParams(chain, options, gasPrice)}
}

export const getCollectLimitOrderCall = (
    limitOrderManager: Contract<ContractAbi>, 
    account: string,
    chain: BaseChain,
    params: CollectLimOrderParam, 
    gasPrice: number | string
) : {collectLimitOrderCalling: any, options: any} => {
    const strictERC20Token = params.strictERC20Token

    const options = {
        from: account,
        maxFeePerGas: gasPrice,
    }

    let outputIsChainCoin = false
    if (strictERC20Token == undefined) {
        outputIsChainCoin = isGasToken(params.tokenX, chain.id) || isGasToken(params.tokenY, chain.id)
    } else {
        outputIsChainCoin = (!strictERC20Token && (isGasOrWrappedGasToken(params.tokenX, chain.id) || isGasOrWrappedGasToken(params.tokenY, chain.id)))
    }

    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress;
    const callings = []

    const collectCalling = limitOrderManager.methods.collectLimOrder(
        innerRecipientAddress,
        params.orderIdx,
        params.collectDecAmount,
        params.collectEarnAmount
    )

    callings.push(collectCalling)
    if (outputIsChainCoin) {
        callings.push(limitOrderManager.methods.unwrapWETH9('0', finalRecipientAddress))
        let sweepTokenAddress = getSwapTokenAddress(params.tokenX)
        if (chain.tokenSymbol === params.tokenX.symbol) {
            sweepTokenAddress = getSwapTokenAddress(params.tokenY)
        }
        callings.push(limitOrderManager.methods.sweepToken(sweepTokenAddress, '0', finalRecipientAddress))
    }
    
    if (callings.length === 1) {
        return {collectLimitOrderCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {collectLimitOrderCalling: limitOrderManager.methods.multicall(multicall), options: buildSendingParams(chain, options, gasPrice)}
}
