import { BaseChain, ChainId, TokenInfoFormatted } from "../types"
import { BigNumber } from 'bignumber.js'
import Web3 from "web3"
import { Contract } from 'web3-eth-contract'

import { AbiItem } from 'web3-utils'
// const memoizeOne = require('memoize-one')
import abi from './erc20.json'

export const amount2Decimal = (amount: BigNumber, token: TokenInfoFormatted): number => {
    return Number(amount.div(10 ** token.decimal))
}

export const decimal2Amount = (amountDecimal: number, token: TokenInfoFormatted): BigNumber => {
    return new BigNumber(amountDecimal).times(10 ** token.decimal)
}

export const getErc20TokenContract = (address: string, web3: Web3) => {
    return getContract(abi, address, web3)
}


export const getContract = (abi: any, address: string, web3: Web3) => {
    return new web3.eth.Contract(
        abi as unknown as AbiItem,
        address,
        {}
    )
}

// type getContractFn = <T>(abi: any, address: string, web3: Web3) => T
// TODO: memoize getContract fail
// const memoizedGetContract = memoizeOne(getContract) as getContractFn

// export const getErc20TokenContract = (
//     address: string,
//     web3: Web3
// ): Contract => {
//     return memoizedGetContract<Contract>(abi, address, web3)
// }

export const fetchToken = async(tokenAddr: string, chain: BaseChain, web3: Web3): Promise<TokenInfoFormatted> => {
    const contract = getContract(abi, tokenAddr, web3);
    const decimal = Number(await contract.methods.decimals().call());
    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();
    const tokenInfo: TokenInfoFormatted = {
        name,
        symbol,
        chainId: chain.id,
        decimal,
        icon: '/assets/tokens/default.svg',
        custom: true,
        address: tokenAddr
    };
    return tokenInfo;
}

export const getSwapTokenAddress = (token: TokenInfoFormatted): string => {
    return token.wrapTokenAddress ?? token.address
}
