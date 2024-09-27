
import Web3, { ContractAbi } from 'web3';
import { Contract } from 'web3-eth-contract';
import { getEVMContract, getTokenChainPath, getTokenChainPathReverse } from '../../base/utils';

import quoterAbi from './abi.json';
import { SwapExactInputParams, SwapExactOutputParams, UniversalPoolPrice } from '../types';
import { getUniversalHexPath, outFeeTier2OutFeeContractNumber } from '../utils';
import { getSwapTokenAddress, TokenInfoFormatted } from '../../base';

export const getUniversalQuoterContract = (address: string, web3: Web3): Contract<ContractAbi> => {
    return getEVMContract(quoterAbi, address, web3);
};

interface QuoterContractPoolPrice {
    // true for classic (V2Pool)
    // false for not classic (V3Pool)
    usePoint: boolean;

    // for not classic (V3Pool)
    point: number; 

    // for classic (V2Pool)
    reserveIn: string;
    reserveOut: string;
}

function convertQuoterPriceListToPriceList(tokenChain: TokenInfoFormatted[], quoterPriceList: QuoterContractPoolPrice[]) {
    const priceList = quoterPriceList.map((p, i)=>{
        const usePoint = Boolean(p.usePoint);
        if (usePoint) {
            return {
                isV2: false,
                point: Number(p.point)
            } as UniversalPoolPrice
        } else {
            const reserveIn = BigInt(p.reserveIn).toString();
            const reserveOut = BigInt(p.reserveOut).toString();
            const tokenInAddress = getSwapTokenAddress(tokenChain[i]).toLowerCase();
            const tokenOutAddress = getSwapTokenAddress(tokenChain[i + 1]).toLowerCase();
            const tokenInIsToken0 = (tokenInAddress < tokenOutAddress)
            return {
                isV2: true,
                reserve0: tokenInIsToken0? reserveIn: reserveOut,
                reserve1: tokenInIsToken0? reserveOut: reserveIn,
                reserveIn,
                reserveOut,
            } as UniversalPoolPrice
        }
    })
    return priceList;
}

export const quoteExactInput = async (
    universalQuoter: Contract<ContractAbi>, 
    params: SwapExactInputParams,
    limit: boolean
) : Promise<{outputAmount: string, poolPriceList: UniversalPoolPrice[]}> => {
    
    const path = getUniversalHexPath(
        params.feeTier.slice(), 
        params.isV2.slice(), 
        params.tokenChain.slice()
    )

    const quoterParams = {
        amount: params.inputAmount,
        path,
        limit,
        outFee: outFeeTier2OutFeeContractNumber(params.outChargeFeeTier)
    }

    const {acquire, price} = await universalQuoter.methods.swapAmount(quoterParams).call() as any
    return {
        outputAmount: acquire.toString(),
        poolPriceList: convertQuoterPriceListToPriceList(
            params.tokenChain,
            (price as QuoterContractPoolPrice[]).slice()
        )
    }
}

export const quoteExactOutput = async (
    universalQuoter: Contract<ContractAbi>, 
    params: SwapExactOutputParams,
    limit: boolean
) : Promise<{inputAmount: string, poolPriceList: UniversalPoolPrice[]}> => {
    
    const path = getUniversalHexPath(
        params.feeTier.slice().reverse(), 
        params.isV2.slice().reverse(), 
        params.tokenChain.slice().reverse()
    )

    const quoterParams = {
        amount: params.outputAmount,
        path,
        limit,
        outFee: outFeeTier2OutFeeContractNumber(params.outChargeFeeTier)
    }

    const {cost, price: rawPriceList} = await universalQuoter.methods.swapDesire(quoterParams).call() as any
    const price = (rawPriceList as QuoterContractPoolPrice[]).slice().reverse()
    return {
        inputAmount: cost.toString(),
        poolPriceList: convertQuoterPriceListToPriceList(
            params.tokenChain,
            price
        )
    }
}

