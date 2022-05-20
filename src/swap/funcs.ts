
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { BaseChain, buildSendingParams } from '../base/types';
import { getEVMContract, getTokenChainPath, getTokenChainPathReverse } from '../base/utils';

import swapAbi from './abi.json';
import { SwapChainWithExactInputParams, SwapChainWithExactOutputParams, SwapSingleWithExactInputParams, SwapSingleWithExactOutputParams } from './types';

export const getSwapContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(swapAbi, address, web3);
};

const getSwapSingleWithExactInputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactInputParams, 
    gasPrice: number | string,
    gasLimit?: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const isX2Y = params.inputToken.address.toLowerCase() < params.inputToken.address.toLowerCase()
    const boundaryPt = params.boundaryPt ?? (isX2Y ? -799999 : 799999)
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }

    const inputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === params.inputToken.symbol);
    const outputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === params.outputToken.symbol);
    if (inputIsChainCoin) {
        options.value = params.inputAmount;
    }
    const recipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : account;
    const callings = []

    let swapCalling = undefined
    if (isX2Y) {
        swapCalling = swapContract.methods.swapX2Y({
            tokenX: params.inputToken.address,
            tokenY: params.outputToken.address,
            fee: params.fee,
            boundaryPt,
            recipient: recipientAddress,
            amount: params.inputAmount,
            maxPayed: '0',
            minAcquired: params.minOutputAmount,
            deadline
        })
    } else {
        swapCalling = swapContract.methods.swapY2X({
            tokenX: params.outputToken.address,
            tokenY: params.inputToken.address,
            fee: params.fee,
            boundaryPt,
            recipient: recipientAddress,
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
        // callings.push(swapContract.methods.sweepToken(params.inputToken.address, '0', account))
        callings.push(swapContract.methods.unwrapWETH9('0', account))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options}
}

export const swapSingleWithExactInputEstimateGas = async (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactInputParams,
    gasPrice: string | number
) : Promise<number> => {
    const {swapCalling, options} = getSwapSingleWithExactInputCall(swapContract, account, chain, params, gasPrice);
    return swapCalling.estimateGas(buildSendingParams(chain, options, gasPrice));
}

export const swapSingleWithExactInput = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactInputParams,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any>=> {
    const {swapCalling, options} = getSwapSingleWithExactInputCall(swapContract, account, chain, params, gasPrice, gasLimit);
    return swapCalling.send(buildSendingParams(chain, options, gasPrice));
}

const getSwapSingleWithExactOutputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactOutputParams, 
    gasPrice: number | string,
    gasLimit?: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const isX2Y = params.inputToken.address.toLowerCase() < params.inputToken.address.toLowerCase()
    const boundaryPt = params.boundaryPt ?? (isX2Y ? -799999 : 799999)
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }

    const inputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === params.inputToken.symbol);
    const outputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === params.outputToken.symbol);
    if (inputIsChainCoin) {
        options.value = params.maxInputAmount;
    }
    const recipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : account;
    const callings = []

    let swapCalling = undefined
    if (isX2Y) {
        swapCalling = swapContract.methods.swapX2YDesireY({
            tokenX: params.inputToken.address,
            tokenY: params.outputToken.address,
            fee: params.fee,
            boundaryPt,
            recipient: recipientAddress,
            amount: params.outputAmount,
            maxPayed: params.maxInputAmount,
            minAcquired: params.outputAmount,
            deadline
        })
    } else {
        swapCalling = swapContract.methods.swapY2XDesireX({
            tokenX: params.outputToken.address,
            tokenY: params.inputToken.address,
            fee: params.fee,
            boundaryPt,
            recipient: recipientAddress,
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
        // callings.push(swapContract.methods.sweepToken(params.inputToken.address, '0', account))
        callings.push(swapContract.methods.unwrapWETH9('0', account))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options}
}

export const swapSingleWithExactOutputEstimateGas = async (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactOutputParams,
    gasPrice: string | number
) : Promise<number> => {
    const {swapCalling, options} = getSwapSingleWithExactOutputCall(swapContract, account, chain, params, gasPrice);
    return swapCalling.estimateGas(buildSendingParams(chain, options, gasPrice));
}

export const swapSingleWithExactOutput = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapSingleWithExactOutputParams,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any>=> {
    const {swapCalling, options} = getSwapSingleWithExactOutputCall(swapContract, account, chain, params, gasPrice, gasLimit);
    return swapCalling.send(buildSendingParams(chain, options, gasPrice));
}


const getSwapChainWithExactInputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactInputParams, 
    gasPrice: number | string,
    gasLimit?: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }
    const inputToken = params.tokenChain[0]
    const outputToken = params.tokenChain[params.tokenChain.length - 1]
    const path = getTokenChainPath(params.tokenChain, params.feeChain)

    const inputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === inputToken.symbol);
    const outputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === outputToken.symbol);
    if (inputIsChainCoin) {
        options.value = params.inputAmount;
    }
    const recipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : account;
    const callings = []

    const swapCalling = swapContract.methods.swapAmount({
        path,
        recipient: recipientAddress,
        amount: params.inputAmount,
        minAcquired: params.minOutputAmount,
        deadline
    })
    callings.push(swapCalling)
    if (inputIsChainCoin) {
        callings.push(swapContract.methods.refundETH())
    }
    if (outputIsChainCoin) {
        // callings.push(swapContract.methods.sweepToken(params.inputToken.address, '0', account))
        callings.push(swapContract.methods.unwrapWETH9('0', account))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options}
}

export const swapChainWithExactInputEstimateGas = async (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactInputParams,
    gasPrice: string | number
) : Promise<number> => {
    const {swapCalling, options} = getSwapChainWithExactInputCall(swapContract, account, chain, params, gasPrice);
    return swapCalling.estimateGas(buildSendingParams(chain, options, gasPrice));
}

export const swapChainWithExactInput = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactInputParams,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any>=> {
    const {swapCalling, options} = getSwapChainWithExactInputCall(swapContract, account, chain, params, gasPrice, gasLimit);
    return swapCalling.send(buildSendingParams(chain, options, gasPrice));
}


const getSwapChainWithExactOutputCall = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactOutputParams, 
    gasPrice: number | string,
    gasLimit?: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }
    const inputToken = params.tokenChain[0]
    const outputToken = params.tokenChain[params.tokenChain.length - 1]
    const path = getTokenChainPathReverse(params.tokenChain, params.feeChain)

    const inputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === inputToken.symbol);
    const outputIsChainCoin = (!strictERC20Token && chain.tokenSymbol === outputToken.symbol);
    if (inputIsChainCoin) {
        options.value = params.maxInputAmount;
    }
    const recipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : account;
    const callings = []

    const swapCalling = swapContract.methods.swapAmount({
        path,
        recipient: recipientAddress,
        desire: params.outputAmount,
        maxPayed: params.maxInputAmount,
        deadline
    })
    callings.push(swapCalling)
    if (inputIsChainCoin) {
        callings.push(swapContract.methods.refundETH())
    }
    if (outputIsChainCoin) {
        // callings.push(swapContract.methods.sweepToken(params.inputToken.address, '0', account))
        callings.push(swapContract.methods.unwrapWETH9('0', account))
    }
    if (callings.length === 1) {
        return {swapCalling: callings[0], options}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {swapCalling: swapContract.methods.multicall(multicall), options}
}

export const swapChainWithExactOutputEstimateGas = async (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactOutputParams,
    gasPrice: string | number
) : Promise<number> => {
    const {swapCalling, options} = getSwapChainWithExactOutputCall(swapContract, account, chain, params, gasPrice);
    return swapCalling.estimateGas(buildSendingParams(chain, options, gasPrice));
}

export const swapChainWithExactOutput = (
    swapContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactOutputParams,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any>=> {
    const {swapCalling, options} = getSwapChainWithExactOutputCall(swapContract, account, chain, params, gasPrice, gasLimit);
    return swapCalling.send(buildSendingParams(chain, options, gasPrice));
}