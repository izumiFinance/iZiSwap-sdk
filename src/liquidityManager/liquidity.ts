import { Contract } from 'web3-eth-contract'
import { BaseChain, buildSendingParams } from '../base/types'
import { AddLiquidityParam, CollectLiquidityParam, DecLiquidityParam, MintParam } from './types'
import { getSwapTokenAddress, isGasOrWrappedGasToken, isGasToken } from '../base/token';
import { ContractAbi } from 'web3';

export const getMintCall = (
    liquidityManagerContract: Contract<ContractAbi>,
    account: string,
    chain: BaseChain,
    params: MintParam,
    gasPrice: number | string
): {mintCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()
    const strictERC20Token = params.strictERC20Token
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    if (strictERC20Token == undefined) {
        if (isGasToken(params.tokenA, chain.id)) {
            options.value = params.maxAmountA
        }
        if (isGasToken(params.tokenB, chain.id)) {
            options.value = params.maxAmountB
        }
    } else if (!strictERC20Token) {
        if (isGasOrWrappedGasToken(params.tokenA, chain.id)) {
            options.value = params.maxAmountA
        }
        if (isGasOrWrappedGasToken(params.tokenB, chain.id)) {
            options.value = params.maxAmountB
        }
    }
    const recipientAddress = params.recipient ?? account;
    const callings = []
    let mintCalling = undefined
    if (ifReverse) {
        mintCalling = liquidityManagerContract.methods.mint({
            miner: recipientAddress,
            tokenX: getSwapTokenAddress(params.tokenB),
            tokenY: getSwapTokenAddress(params.tokenA),
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
            tokenX: getSwapTokenAddress(params.tokenA),
            tokenY: getSwapTokenAddress(params.tokenB),
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
        return {mintCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }
    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    const mintMulticall = liquidityManagerContract.methods.multicall(multicall)
    return {mintCalling: mintMulticall, options: buildSendingParams(chain, options, gasPrice)}
}


export const getAddLiquidityCall = (
    liquidityManagerContract: Contract<ContractAbi>,
    account: string,
    chain: BaseChain,
    params: AddLiquidityParam,
    gasPrice: number | string
): {addLiquidityCalling: any, options: any} => {
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    const strictERC20Token = params.strictERC20Token
    if (strictERC20Token == undefined) {
        if (isGasToken(params.tokenA, chain.id)) {
            options.value = params.maxAmountA
        }
        if (isGasToken(params.tokenB, chain.id)) {
            options.value = params.maxAmountB
        }
    } else if (!strictERC20Token) {
        if (isGasOrWrappedGasToken(params.tokenA, chain.id)) {
            options.value = params.maxAmountA
        }
        if (isGasOrWrappedGasToken(params.tokenB, chain.id)) {
            options.value = params.maxAmountB
        }
    }
    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()
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
        return {addLiquidityCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }
    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    const addMulticall = liquidityManagerContract.methods.multicall(multicall)
    return {addLiquidityCalling: addMulticall, options: buildSendingParams(chain, options, gasPrice)}
}

export const getDecLiquidityCall = (
    liquidityManagerContract: Contract<ContractAbi>,
    account: string,
    chain: BaseChain,
    params: DecLiquidityParam,
    gasPrice: number | string
): {decLiquidityCalling: any, options: any} => {
    const options = {
        from: account,
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
    return {decLiquidityCalling, options: buildSendingParams(chain, options, gasPrice)}
}

export const getCollectLiquidityCall = (
    liquidityManagerContract: Contract<ContractAbi>, 
    account: string,
    chain: BaseChain,
    params: CollectLiquidityParam, 
    gasPrice: number | string
) : {collectLiquidityCalling: any, options: any} => {
    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()
    const strictERC20Token = params.strictERC20Token

    const options = {
        from: account,
        maxFeePerGas: gasPrice,
    }

    let outputIsChainCoin = false
    if (strictERC20Token == undefined) {
        outputIsChainCoin = isGasToken(params.tokenA, chain.id) || isGasToken(params.tokenB, chain.id)
    } else {
        outputIsChainCoin = (!strictERC20Token && (isGasOrWrappedGasToken(params.tokenA, chain.id) || isGasOrWrappedGasToken(params.tokenB, chain.id)))
    }

    const finalRecipientAddress = params.recipient ?? account
    const innerRecipientAddress = outputIsChainCoin ? '0x0000000000000000000000000000000000000000' : finalRecipientAddress
    const callings = []

    let collectCalling = undefined
    if (ifReverse) {
        collectCalling = liquidityManagerContract.methods.collect(
            innerRecipientAddress,
            params.tokenId,
            params.maxAmountB,
            params.maxAmountA
        )
    } else {
        collectCalling = liquidityManagerContract.methods.collect(
            innerRecipientAddress,
            params.tokenId,
            params.maxAmountA,
            params.maxAmountB
        )
    }
    callings.push(collectCalling)
    if (outputIsChainCoin) {
        callings.push(liquidityManagerContract.methods.unwrapWETH9('0', finalRecipientAddress))
        let sweepTokenAddress = getSwapTokenAddress(params.tokenA)
        if (chain.tokenSymbol === params.tokenA.symbol) {
            sweepTokenAddress = getSwapTokenAddress(params.tokenB)
        }
        callings.push(liquidityManagerContract.methods.sweepToken(sweepTokenAddress, '0', finalRecipientAddress))
    }
    
    if (callings.length === 1) {
        return {collectLiquidityCalling: callings[0], options: buildSendingParams(chain, options, gasPrice)}
    }

    const multicall: string[] = []
    for (const c of callings) {
        multicall.push(c.encodeABI())
    }
    return {collectLiquidityCalling: liquidityManagerContract.methods.multicall(multicall), options: buildSendingParams(chain, options, gasPrice)}
}
