
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';

import {BaseChain, getSwapTokenAddress, isGasOrWrappedGasToken, isGasToken, TokenInfoFormatted} from '../base'

import { getEVMContract, getTokenChainPath, getTokenChainPathReverse, buildSendingParams } from '../base';

import swapAbi from './abi.json';
import { SwapChainWithExactInputParams, SwapChainWithExactOutputParams, SwapSingleWithExactInputParams, SwapSingleWithExactOutputParams } from './types';

export const getSwapContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(swapAbi, address, web3);
};

export const getSwapSingleWithExactInputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactInputParams, 
    gasPrice: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const isX2Y = getSwapTokenAddress(params.inputToken).toLowerCase() < getSwapTokenAddress(params.outputToken).toLowerCase()
    const boundaryPt = params.boundaryPt ?? (isX2Y ? -799999 : 799999)
    const strictERC20Token = params.strictERC20Token
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }

    let inputIsChainCoin = false
    let outputIsChainCoin = false
    if (strictERC20Token == undefined) {
        inputIsChainCoin = isGasToken(params.inputToken, chain.id)
        outputIsChainCoin = isGasToken(params.outputToken, chain.id)
    } else {
        inputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(params.inputToken, chain.id))
        outputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(params.outputToken, chain.id))
    }

    if (inputIsChainCoin) {
        options.value = params.inputAmount;
    }
    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress;
    const callings = []

    let swapCalling = undefined
    if (isX2Y) {
        swapCalling = swapContract.methods.swapX2Y({
            tokenX: getSwapTokenAddress(params.inputToken),
            tokenY: getSwapTokenAddress(params.outputToken),
            fee: params.fee,
            boundaryPt,
            recipient: innerRecipientAddress,
            amount: params.inputAmount,
            maxPayed: '0',
            minAcquired: params.minOutputAmount,
            deadline
        })
    } else {
        swapCalling = swapContract.methods.swapY2X({
            tokenX: getSwapTokenAddress(params.outputToken),
            tokenY: getSwapTokenAddress(params.inputToken),
            fee: params.fee,
            boundaryPt,
            recipient: innerRecipientAddress,
            amount: params.inputAmount,
            maxPayed: '0',
            minAcquired: params.minOutputAmount,
            deadline
        })
    }
    callings.push(swapCalling)
    if (inputIsChainCoin) {
        callings.push(swapContract.methods.refundETH())
    }
    if (outputIsChainCoin) {
        callings.push(swapContract.methods.unwrapWETH9('0', finalRecipientAddress))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options: buildSendingParams(chain, options, gasPrice)}
}

export const getSwapSingleWithExactOutputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactOutputParams, 
    gasPrice: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const isX2Y = getSwapTokenAddress(params.inputToken).toLowerCase() < getSwapTokenAddress(params.outputToken).toLowerCase()
    const boundaryPt = params.boundaryPt ?? (isX2Y ? -799999 : 799999)
    const strictERC20Token = params.strictERC20Token
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }

    let inputIsChainCoin = false
    let outputIsChainCoin = false
    if (strictERC20Token == undefined) {
        inputIsChainCoin = isGasToken(params.inputToken, chain.id)
        outputIsChainCoin = isGasToken(params.outputToken, chain.id)
    } else {
        inputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(params.inputToken, chain.id))
        outputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(params.outputToken, chain.id))
    }

    if (inputIsChainCoin) {
        options.value = params.maxInputAmount;
    }
    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress;
    const callings = []

    let swapCalling = undefined
    if (isX2Y) {
        swapCalling = swapContract.methods.swapX2YDesireY({
            tokenX: getSwapTokenAddress(params.inputToken),
            tokenY: getSwapTokenAddress(params.outputToken),
            fee: params.fee,
            boundaryPt,
            recipient: innerRecipientAddress,
            amount: params.outputAmount,
            maxPayed: params.maxInputAmount,
            minAcquired: params.outputAmount,
            deadline
        })
    } else {
        swapCalling = swapContract.methods.swapY2XDesireX({
            tokenX: getSwapTokenAddress(params.outputToken),
            tokenY: getSwapTokenAddress(params.inputToken),
            fee: params.fee,
            boundaryPt,
            recipient: innerRecipientAddress,
            amount: params.outputAmount,
            maxPayed: params.maxInputAmount,
            minAcquired: params.outputAmount,
            deadline
        })
    }
    callings.push(swapCalling)
    if (inputIsChainCoin) {
        callings.push(swapContract.methods.refundETH())
    }
    if (outputIsChainCoin) {
        callings.push(swapContract.methods.unwrapWETH9('0', finalRecipientAddress))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options: buildSendingParams(chain, options, gasPrice)}
}

export const getSwapChainWithExactInputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactInputParams, 
    gasPrice: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    const inputToken = params.tokenChain[0]
    const outputToken = params.tokenChain[params.tokenChain.length - 1]
    const path = getTokenChainPath(params.tokenChain, params.feeChain)

    let inputIsChainCoin = false
    let outputIsChainCoin = false
    if (strictERC20Token == undefined) {
        inputIsChainCoin = isGasToken(inputToken, chain.id)
        outputIsChainCoin = isGasToken(outputToken, chain.id)
    } else {
        inputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(inputToken, chain.id))
        outputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(outputToken, chain.id))
    }
    if (inputIsChainCoin) {
        options.value = params.inputAmount;
    }
    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress;
    const callings = []

    const swapCalling = swapContract.methods.swapAmount({
        path,
        recipient: innerRecipientAddress,
        amount: params.inputAmount,
        minAcquired: params.minOutputAmount,
        deadline
    })
    callings.push(swapCalling)
    if (inputIsChainCoin) {
        callings.push(swapContract.methods.refundETH())
    }
    if (outputIsChainCoin) {
        callings.push(swapContract.methods.unwrapWETH9('0', finalRecipientAddress))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options: buildSendingParams(chain, options, gasPrice)}
}


export const getSwapChainWithExactOutputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactOutputParams, 
    gasPrice: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    const inputToken = params.tokenChain[0]
    const outputToken = params.tokenChain[params.tokenChain.length - 1]
    const path = getTokenChainPathReverse(params.tokenChain, params.feeChain)

    let inputIsChainCoin = false
    let outputIsChainCoin = false
    if (strictERC20Token == undefined) {
        inputIsChainCoin = isGasToken(inputToken, chain.id)
        outputIsChainCoin = isGasToken(outputToken, chain.id)
    } else {
        inputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(inputToken, chain.id))
        outputIsChainCoin = (!strictERC20Token && isGasOrWrappedGasToken(outputToken, chain.id))
    }
    if (inputIsChainCoin) {
        options.value = params.maxInputAmount;
    }
    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress;
    const callings = []

    const swapCalling = swapContract.methods.swapDesire({
        path,
        recipient: innerRecipientAddress,
        desire: params.outputAmount,
        maxPayed: params.maxInputAmount,
        deadline
    })
    callings.push(swapCalling)
    if (inputIsChainCoin) {
        callings.push(swapContract.methods.refundETH())
    }
    if (outputIsChainCoin) {
        callings.push(swapContract.methods.unwrapWETH9('0', finalRecipientAddress))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options: buildSendingParams(chain, options, gasPrice)}
}
