
import Web3, { ContractAbi } from 'web3';
import { Contract } from 'web3-eth-contract';
import { getSwapTokenAddress } from '../base';
import { getEVMContract, getTokenChainPath, getTokenChainPathReverse } from '../base/utils';

import quoterAbi from './abi.json';
import { QuoterSwapChainWithExactInputParams, QuoterSwapChainWithExactOutputParams, QuoterSwapSingleWithExactInputParams, QuoterSwapSingleWithExactOutputParams } from './types';

export const getQuoterContract = (address: string, web3: Web3): Contract<ContractAbi> => {
    return getEVMContract(quoterAbi, address, web3);
};

export const quoterSwapSingleWithExactInput = async (
    quoterContract: Contract<ContractAbi>, 
    // account: string,
    // chain: BaseChain,
    params: QuoterSwapSingleWithExactInputParams
) : Promise<{outputAmount: string, finalPoint: number}> => {
    const isX2Y = getSwapTokenAddress(params.inputToken).toLowerCase() < getSwapTokenAddress(params.outputToken).toLowerCase()
    const boundaryPt = params.boundaryPt ?? (isX2Y ? -799999 : 799999)
    
    if (isX2Y) {
        const {amountY, finalPoint} = await quoterContract.methods.swapX2Y(
            getSwapTokenAddress(params.inputToken),
            getSwapTokenAddress(params.outputToken),
            params.fee,
            params.inputAmount,
            boundaryPt
        ).call() as any;
        return {
            outputAmount: amountY.toString(),
            finalPoint: Number(finalPoint)
        }
    } else {
        const {amountX, finalPoint} = await quoterContract.methods.swapY2X(
            getSwapTokenAddress(params.outputToken),
            getSwapTokenAddress(params.inputToken),
            params.fee,
            params.inputAmount,
            boundaryPt
        ).call() as any;
        return {
            outputAmount: amountX.toString(),
            finalPoint: Number(finalPoint)
        }
    }
}

export const quoterSwapSingleWithExactOutput = async (
    quoterContract: Contract<ContractAbi>, 
    // account: string,
    // chain: BaseChain,
    params: QuoterSwapSingleWithExactOutputParams
) : Promise<{inputAmount: string, finalPoint: number}> => {
    const isX2Y = getSwapTokenAddress(params.inputToken).toLowerCase() < getSwapTokenAddress(params.outputToken).toLowerCase()
    const boundaryPt = params.boundaryPt ?? (isX2Y ? -799999 : 799999)
    
    if (isX2Y) {
        const {amountX, finalPoint} = await quoterContract.methods.swapX2YDesireY(
            getSwapTokenAddress(params.inputToken),
            getSwapTokenAddress(params.outputToken),
            params.fee,
            params.outputAmount,
            boundaryPt
        ).call() as any;
        return {
            inputAmount: amountX.toString(),
            finalPoint: Number(finalPoint)
        }
    } else {
        const {amountY, finalPoint} = await quoterContract.methods.swapY2XDesireX(
            getSwapTokenAddress(params.outputToken),
            getSwapTokenAddress(params.inputToken),
            params.fee,
            params.outputAmount,
            boundaryPt
        ).call() as any;
        return {
            inputAmount: amountY.toString(),
            finalPoint: Number(finalPoint)
        }
    }
}

export const quoterSwapChainWithExactInput = async (
    quoterContract: Contract<ContractAbi>, 
    params: QuoterSwapChainWithExactInputParams
) : Promise<{outputAmount: string, finalPoints: number[]}> => {
    
    const path = getTokenChainPath(params.tokenChain, params.feeChain)

    const {acquire, pointAfterList} = await quoterContract.methods.swapAmount(params.inputAmount, path).call() as any;
    return {
        outputAmount: acquire.toString(),
        finalPoints: pointAfterList.map((e: any)=>Number(e))
    }
}

export const quoterSwapChainWithExactOutput = async (
    quoterContract: Contract<ContractAbi>,
    params: QuoterSwapChainWithExactOutputParams
) : Promise<{inputAmount: string, finalPoints: number[]}> => {
    const path = getTokenChainPathReverse(params.tokenChain, params.feeChain)
    const {cost, pointAfterList} = await quoterContract.methods.swapDesire(params.outputAmount, path).call() as any;
    const finalPoints = []
    for (let i = pointAfterList.length - 1; i >= 0; i --) {
        finalPoints.push(Number(pointAfterList[i]))
    }
    return {
        inputAmount: cost.toString(),
        finalPoints
    }
}