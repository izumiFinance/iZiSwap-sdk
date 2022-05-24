import { Contract } from 'web3-eth-contract'
import { PromiEvent } from 'web3-core';
import { BaseChain, buildSendingParams } from '../base/types'
import { AddLiquidityParam, CollectLiquidityParam, DecLiquidityParam, MintParam } from './types'

const getMintCall = (
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: MintParam,
    gasPrice: number | string,
    gasLimit?: number | string
): {mintCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const ifReverse = params.tokenA.address.toLowerCase() > params.tokenB.address.toLowerCase()
    const strictERC20Token = params.strictERC20Token ?? false
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }
    if (!strictERC20Token) {
        if (chain.tokenSymbol === params.tokenA.symbol) {
            options.value = params.maxAmountA
        }
        if (chain.tokenSymbol === params.tokenB.symbol) {
            options.value = params.maxAmountB
        }
    }
    const recipientAddress = params.recipient ?? account;
    const callings = []
    let mintCalling = undefined
    if (ifReverse) {
        mintCalling = liquidityManagerContract.methods.mint({
            miner: recipientAddress,
            tokenX: params.tokenB.address,
            tokenY: params.tokenA.address,
            fee: params.fee,
            pl: params.leftPoint,
            pr: params.rightPoint,
            xLim: params.maxAmountB,
            yLim: params.maxAmountA,
            amountXMin: params.minAmountB,
            amountYMin: params.minAmountA,
            deadline
        })
    } else {
        mintCalling = liquidityManagerContract.methods.mint({
            miner: recipientAddress,
            tokenX: params.tokenA.address,
            tokenY: params.tokenB.address,
            fee: params.fee,
            pl: params.leftPoint,
            pr: params.rightPoint,
            xLim: params.maxAmountA,
            yLim: params.maxAmountB,
            amountXMin: params.minAmountA,
            amountYMin: params.minAmountB,
            deadline
        })
    }
    callings.push(mintCalling)
    if (options.value !== '0') {
        callings.push(liquidityManagerContract.methods.refundETH())
    }
    if (callings.length === 1) {
        return {mintCalling: callings[0], options}
    }
    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {mintCalling: multicall, options}
}

export const mintEstimateGas = async(
    mintContract: Contract,
    account: string,
    chain: BaseChain,
    params: MintParam,
    gasPrice: string | number
) : Promise<number> => {
    const {mintCalling, options} = getMintCall(mintContract, account, chain, params, gasPrice)
    return mintCalling.estimateGas(buildSendingParams(chain, options, gasPrice))
}

export const mint = (
    mintContract: Contract,
    account: string,
    chain: BaseChain,
    params: MintParam,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any> => {
    const {mintCalling, options} = getMintCall(mintContract, account, chain, params, gasPrice, gasLimit)
    return mintCalling.send(buildSendingParams(chain, options, gasPrice))
}


const getAddLiquidityCall = (
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: AddLiquidityParam,
    gasPrice: number | string,
    gasLimit?: number | string
): {addLiquidityCalling: any, options: any} => {
    const options = {
        from: account,
        value: '0',
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }
    const strictERC20Token = params.strictERC20Token ?? false
    if (!strictERC20Token) {
        if (chain.tokenSymbol === params.tokenA.symbol) {
            options.value = params.maxAmountA
        }
        if (chain.tokenSymbol === params.tokenB.symbol) {
            options.value = params.maxAmountB
        }
    }
    const ifReverse = params.tokenA.address.toLowerCase() > params.tokenB.address.toLowerCase()
    const deadline = params.deadline ?? '0xffffffff'
    const callings = []
    let addLiquidityCalling = undefined
    if (ifReverse) {
        addLiquidityCalling = liquidityManagerContract.methods.addLiquidity({
            lid: params.tokenId,
            xLim: params.maxAmountB,
            yLim: params.maxAmountA,
            amountXMin: params.minAmountB,
            amountYMin: params.minAmountA,
            deadline
        })
    } else {
        addLiquidityCalling = liquidityManagerContract.methods.addLiquidity({
            lid: params.tokenId,
            xLim: params.maxAmountA,
            yLim: params.maxAmountB,
            amountXMin: params.minAmountA,
            amountYMin: params.minAmountB,
            deadline
        })
    }
    callings.push(addLiquidityCalling)
    if (options.value !== '0') {
        callings.push(liquidityManagerContract.methods.refundETH())
    }
    if (callings.length === 1) {
        return {addLiquidityCalling: callings[0], options}
    }
    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {addLiquidityCalling: multicall, options}
}

export const addLiquidityEstimateGas = async(
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: AddLiquidityParam,
    gasPrice: string | number
) : Promise<number> => {
    const {addLiquidityCalling, options} = getAddLiquidityCall(liquidityManagerContract, account, chain, params, gasPrice)
    return addLiquidityCalling.estimateGas(buildSendingParams(chain, options, gasPrice))
}

export const addLiquidity = (
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: AddLiquidityParam,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any> => {
    const {addLiquidityCalling, options} = getAddLiquidityCall(liquidityManagerContract, account, chain, params, gasPrice, gasLimit)
    return addLiquidityCalling.send(buildSendingParams(chain, options, gasPrice))
}


const getDecLiquidityCall = (
    liquidityManagerContract: Contract,
    account: string,
    params: DecLiquidityParam,
    gasPrice: number | string,
    gasLimit?: number | string
): {decLiquidityCalling: any, options: any} => {
    const options = {
        from: account,
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }
    
    const deadline = params.deadline ?? '0xffffffff'
    const decLiquidityCalling = liquidityManagerContract.methods.decLiquidity(
        params.tokenId,
        params.liquidDelta,
        params.minAmountX,
        params.minAmountY,
        deadline
    )
    return {decLiquidityCalling, options}
}

export const decLiquidityEstimateGas = async(
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: DecLiquidityParam,
    gasPrice: number | string
) : Promise<number> => {
    const {decLiquidityCalling, options} = getDecLiquidityCall(
        liquidityManagerContract, account, params, gasPrice
    )
    return decLiquidityCalling.estimateGas(
        buildSendingParams(chain, options, gasPrice)
    )
}

export const decLiquidity = (
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: DecLiquidityParam,
    gasPrice: string | number,
    gasLimit: string | number
) : PromiEvent<any> => {
    const {decLiquidityCalling, options} = getDecLiquidityCall(
        liquidityManagerContract, account, params, gasPrice, gasLimit
    )
    return decLiquidityCalling.send(
        buildSendingParams(chain, options, gasPrice)
    )
}


const getCollectLiquidityCall = (
    liquidityManagerContract: Contract, 
    account: string,
    chain: BaseChain,
    params: CollectLiquidityParam, 
    gasPrice: number | string,
    gasLimit?: number | string
) : {collectLiquidityCalling: any, options: any} => {
    const ifReverse = params.tokenA.address.toLowerCase() > params.tokenB.address.toLowerCase()
    const strictERC20Token = params.strictERC20Token ?? false

    const options = {
        from: account,
        gas: gasLimit,
        maxFeePerGas: gasPrice,
    }

    const outputIsChainCoin = (!strictERC20Token && (chain.tokenSymbol === params.tokenA.symbol || chain.tokenSymbol === params.tokenB.symbol));
    
    const recipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : account;
    const callings = []

    let collectCalling = undefined
    if (ifReverse) {
        collectCalling = liquidityManagerContract.methods.collect(
            recipientAddress,
            params.tokenId,
            params.maxAmountB,
            params.maxAmountA
        )
    } else {
        collectCalling = liquidityManagerContract.methods.collect(
            recipientAddress,
            params.tokenId,
            params.maxAmountA,
            params.maxAmountB
        )
    }
    callings.push(collectCalling)
    if (outputIsChainCoin) {
        callings.push(liquidityManagerContract.methods.unwrapWETH9('0', account))
        let sweepTokenAddress = params.tokenA.address
        if (chain.tokenSymbol === params.tokenA.symbol) {
            sweepTokenAddress = params.tokenB.address
        }
        callings.push(liquidityManagerContract.methods.sweepToken(sweepTokenAddress, '0', account))
    }
    
    if (callings.length === 1) {
        return {collectLiquidityCalling: callings[0], options}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {collectLiquidityCalling: liquidityManagerContract.methods.multicall(multicall), options}
}

export const collectLiquidityEstimateGas = async(
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: CollectLiquidityParam, 
    gasPrice: number | string
) : Promise<number> => {
    const {collectLiquidityCalling, options} = getCollectLiquidityCall(
        liquidityManagerContract, account, chain, params, gasPrice
    )
    return collectLiquidityCalling.estimateGas(
        buildSendingParams(chain, options, gasPrice)
    )
}

export const collectLiquidity = async(
    liquidityManagerContract: Contract,
    account: string,
    chain: BaseChain,
    params: CollectLiquidityParam, 
    gasPrice: number | string,
    gasLimit: string | number
) : Promise<number> => {
    const {collectLiquidityCalling, options} = getCollectLiquidityCall(
        liquidityManagerContract, account, chain, params, gasPrice, gasLimit
    )
    return collectLiquidityCalling.send(
        buildSendingParams(chain, options, gasPrice)
    )
}