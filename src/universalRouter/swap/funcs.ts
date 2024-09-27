
import Web3, { ContractAbi } from 'web3';
import { Contract } from 'web3-eth-contract';

import {BaseChain, isGasToken} from '../../base'

import { getEVMContract, getTokenChainPath, getTokenChainPathReverse, buildSendingParams } from '../../base';

import swapAbi from './abi.json';
import { SwapExactInputParams, SwapExactOutputParams } from '../types';
import BigNumber from 'bignumber.js';
import { getUniversalHexPath, outFeeTier2OutFeeContractNumber } from '../utils';

export const getUniversalSwapRouterContract = (address: string, web3: Web3): Contract<ContractAbi> => {
    return getEVMContract(swapAbi, address, web3);
};

/**
 * @param universalSwapRouter, universal swap router contract, can be obtained through getUniversalSwapRouterContract(...)
 * @param account, address of user
 * @param chain, object of BaseChain, describe which chain we are using
 * @param params, some settings of this swap, including swapchain, input amount, min required output amount
 * @param gasPrice, gas price of this swap transaction
 * @return calling, calling of this swap transaction
 * @return options, options of this swap transaction, used in sending transaction
 */
export const getSwapExactInputCall = (
    universalSwapRouter: Contract<ContractAbi>, 
    account: string,
    chain: BaseChain,
    params: SwapExactInputParams, 
    gasPrice: number | string
) : {calling: any, options: any} => {
    
    const swapPathHexString = getUniversalHexPath(
        params.feeTier.slice(), 
        params.isV2.slice(), 
        params.tokenChain.slice()
    )

    const minAcquired = params.minOutputAmount;

    const swapParams = {
        recipient: account,
        amount: params.inputAmount,
        path: swapPathHexString,
        minAcquired,
        deadline: params.deadline ?? '0xffffffff',
        outFee: outFeeTier2OutFeeContractNumber(params.outChargeFeeTier)
    };

    const tokenOut = params.tokenChain[params.tokenChain.length - 1];
    const tokenIn = params.tokenChain[0];

    const ifBuyETH = isGasToken(tokenOut, chain.id);
    const costETH = isGasToken(tokenIn, chain.id) ? new BigNumber(swapParams.amount).toFixed(0) : '0';

    const contract = universalSwapRouter;
    
    const options = buildSendingParams(chain, {
        from: account, 
        maxFeePerGas: gasPrice,
        value: costETH
    }, gasPrice)

    if (ifBuyETH) {
        swapParams.recipient = '0x0000000000000000000000000000000000000000';
        const multicall: string[] = [];
        multicall.push(contract.methods.swapAmount(swapParams).encodeABI());
        multicall.push(contract.methods.unwrapWETH9('0', account).encodeABI());
        const calling = contract.methods.multicall(multicall);
        return {calling, options};
    } else {
        if (costETH !== '0') {
            const multicall: string[] = [];
            multicall.push(contract.methods.swapAmount(swapParams).encodeABI());
            multicall.push(contract.methods.refundETH().encodeABI());
            const calling = contract.methods.multicall(multicall);
            return {calling, options};
        } else {
            const calling = contract.methods.swapAmount(swapParams);
            return {calling, options};
        }
    }
}

/**
 * @param universalSwapRouter, universal swap router contract, can be obtained through getUniversalSwapRouterContract(...)
 * @param account, address of user
 * @param chain, object of BaseChain, describe which chain we are using
 * @param params, some settings of this swap, including swapchain, input amount, min required output amount
 * @param gasPrice, gas price of this swap transaction
 * @return calling, calling of this swap transaction
 * @return options, options of this swap transaction, used in sending transaction
 */
export const getSwapExactOutputCall = (
    universalSwapRouter: Contract<ContractAbi>, 
    account: string,
    chain: BaseChain,
    params: SwapExactOutputParams, 
    gasPrice: number | string
) : {calling: any, options: any} => {
    
    const swapPathHexString = getUniversalHexPath(
        params.feeTier.slice().reverse(), 
        params.isV2.slice().reverse(), 
        params.tokenChain.slice().reverse()
    )
    const maxPayed = params.maxInputAmount;

    const swapParams = {
        recipient: account,
        desire: params.outputAmount,
        path: swapPathHexString,
        maxPayed,
        deadline: params.deadline ?? '0xffffffff',
        outFee: outFeeTier2OutFeeContractNumber(params.outChargeFeeTier)
    };

    const tokenOut = params.tokenChain[params.tokenChain.length - 1];
    const tokenIn = params.tokenChain[0];

    const contract = universalSwapRouter;
    const ifBuyETH = isGasToken(tokenOut, chain.id);
    if (ifBuyETH) {
        swapParams.recipient = '0x0000000000000000000000000000000000000000';
    }
    const costETH = isGasToken(tokenIn, chain.id) ? swapParams.maxPayed : '0';
    const multicall: any[] = [];
    multicall.push(contract.methods.swapDesire(swapParams));
    if (ifBuyETH) {
        multicall.push(contract.methods.unwrapWETH9('0', account));
    }
    if (new BigNumber(costETH).gt('0')) {
        multicall.push(contract.methods.refundETH());
    }
    const calling = (multicall.length > 1) ? contract.methods.multicall(multicall.map((c)=>c.encodeABI())) : multicall[0];
    const options = buildSendingParams(chain, {
        from: account, 
        maxFeePerGas: gasPrice,
        value: costETH
    }, gasPrice)
    return {calling, options};
}