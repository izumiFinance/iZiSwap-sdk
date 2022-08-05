import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { BaseChain, buildSendingParams, getEVMContract, getSwapTokenAddress, getTokenChainPath } from '../base'
import boxAbi from './abi.json'
import { AddLiquidityParams, CollectLiquidityParams, DecLiquidityAndCollectParams, MintParams, SwapChainWithExactInputParams } from './types'

export const getBoxContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(boxAbi, address, web3)
}

export const getMintCall = (
    boxContract: Contract,
    account: string,
    chain: BaseChain,
    params: MintParams,
    gasPrice: number | string
): {mintCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'

    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    if (chain.tokenSymbol === params.tokenA.symbol) {
        options.value = params.maxAmountA
    }
    if (chain.tokenSymbol === params.tokenB.symbol) {
        options.value = params.maxAmountB
    }
    const recipientAddress = params.recipient ?? account
    let mintCalling = undefined

    if (ifReverse) {
        const tokenXIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        mintCalling = boxContract.methods.mint(
            {
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
            },
            tokenXIsWrap,
            tokenYIsWrap
        )
    } else {
        const tokenXIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        mintCalling = boxContract.methods.mint(
            {
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
            },
            tokenXIsWrap,
            tokenYIsWrap
        )
    }
    return {mintCalling, options: buildSendingParams(chain, options, gasPrice)}
}


export const getAddLiquidityCall = (
    boxContract: Contract,
    account: string,
    chain: BaseChain,
    params: AddLiquidityParams,
    gasPrice: number | string
): {addLiquidityCalling: any, options: any} => {

    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    
    if (chain.tokenSymbol === params.tokenA.symbol) {
        options.value = params.maxAmountA
    }
    if (chain.tokenSymbol === params.tokenB.symbol) {
        options.value = params.maxAmountB
    }

    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()
    const deadline = params.deadline ?? '0xffffffff'

    let addLiquidityCalling = undefined
    if (ifReverse) {
        const tokenXIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        addLiquidityCalling = boxContract.methods.addLiquidity(
            {
                lid: params.tokenId,
                xLim: params.maxAmountB,
                yLim: params.maxAmountA,
                amountXMin: params.minAmountB,
                amountYMin: params.minAmountA,
                deadline
            },
            getSwapTokenAddress(params.tokenB),
            getSwapTokenAddress(params.tokenA),
            tokenXIsWrap,
            tokenYIsWrap
        )
    } else {
        const tokenXIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        addLiquidityCalling = boxContract.methods.addLiquidity(
            {
                lid: params.tokenId,
                xLim: params.maxAmountA,
                yLim: params.maxAmountB,
                amountXMin: params.minAmountA,
                amountYMin: params.minAmountB,
                deadline
            },
            getSwapTokenAddress(params.tokenA),
            getSwapTokenAddress(params.tokenB),
            tokenXIsWrap,
            tokenYIsWrap
        )
    }
    return {addLiquidityCalling, options: buildSendingParams(chain, options, gasPrice)}
}

export const getCollectCall = (
    boxContract: Contract,
    account: string,
    chain: BaseChain,
    params: CollectLiquidityParams,
    gasPrice: number | string
): {collectCalling: any, options: any} => {

    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }

    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()

    const recipientAddress = params.recipient ?? account
    let collectCalling = undefined
    if (ifReverse) {
        const tokenXIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        collectCalling = boxContract.methods.collect(
            recipientAddress,
            params.tokenId,
            params.maxAmountB,
            params.maxAmountA,
            getSwapTokenAddress(params.tokenB),
            getSwapTokenAddress(params.tokenA),
            tokenXIsWrap,
            tokenYIsWrap
        )
    } else {
        const tokenXIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        collectCalling = boxContract.methods.collect(
            recipientAddress,
            params.tokenId,
            params.maxAmountA,
            params.maxAmountB,
            getSwapTokenAddress(params.tokenA),
            getSwapTokenAddress(params.tokenB),
            tokenXIsWrap,
            tokenYIsWrap
        )
    }
    return {collectCalling, options: buildSendingParams(chain, options, gasPrice)}
}

export const getDecLiquidityAndCollectCall = (
    boxContract: Contract,
    account: string,
    chain: BaseChain,
    params: DecLiquidityAndCollectParams,
    gasPrice: number | string
): {calling: any, options: any} => {

    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }

    const ifReverse = getSwapTokenAddress(params.tokenA).toLowerCase() > getSwapTokenAddress(params.tokenB).toLowerCase()

    const deadline = params.deadline ?? '0xffffffff'
    const recipientAddress = params.recipient ?? account
    let calling = undefined
    if (ifReverse) {
        const tokenXIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        calling = boxContract.methods.decreaseLiquidity(
            recipientAddress,
            params.tokenId,
            params.liquidDelta,
            params.minAmountB,
            params.minAmountA,
            deadline,
            getSwapTokenAddress(params.tokenB),
            getSwapTokenAddress(params.tokenA),
            tokenXIsWrap,
            tokenYIsWrap
        )
    } else {
        const tokenXIsWrap = !params.tokenA.wrapTokenAddress ? false: true
        const tokenYIsWrap = !params.tokenB.wrapTokenAddress ? false: true
        calling = boxContract.methods.decreaseLiquidity(
            recipientAddress,
            params.tokenId,
            params.liquidDelta,
            params.minAmountA,
            params.minAmountB,
            deadline,
            getSwapTokenAddress(params.tokenA),
            getSwapTokenAddress(params.tokenB),
            tokenXIsWrap,
            tokenYIsWrap
        )
    }
    return {calling, options: buildSendingParams(chain, options, gasPrice)}
}

export const getSwapChainWithExactInputCall = (
    boxContract: Contract, 
    account: string,
    chain: BaseChain,
    params: SwapChainWithExactInputParams, 
    gasPrice: number | string
) : {swapCalling: any, options: any} => {
    const deadline = params.deadline ?? '0xffffffff'
    const options = {
        from: account,
        value: '0',
        maxFeePerGas: gasPrice,
    }
    const path = getTokenChainPath(params.tokenChain, params.feeChain)

    const recipient = params.recipient ?? account

    if (chain.tokenSymbol === params.tokenChain[0].symbol) {
        options.value = params.inputAmount
    }
    const firstIsWrap = !params.tokenChain[0].wrapTokenAddress ? false: true
    const lastIsWrap = !params.tokenChain[params.tokenChain.length - 1].wrapTokenAddress ? false: true

    const swapCalling = boxContract.methods.swapAmount(
        {
            path,
            recipient,
            amount: params.inputAmount,
            minAcquired: params.minOutputAmount,
            deadline
        },
        firstIsWrap,
        lastIsWrap
    )
    return {swapCalling, options: buildSendingParams(chain, options, gasPrice)}
}