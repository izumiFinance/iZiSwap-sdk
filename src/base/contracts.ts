import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { getEVMContract } from "./utils";
import multiContractCallAbi from './abis/multiContractCall.json'

export const getMulticallContracts = (address: string, web3: Web3): Contract => {
    return getEVMContract(multiContractCallAbi, address, web3);
}