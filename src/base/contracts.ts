import Web3, { ContractAbi } from "web3";
import { Contract } from "web3-eth-contract";
import multiContractCallAbi from './abis/multiContractCall.json'
import { getEVMContract } from "./utils";

export const getMulticallContracts = (address: string, web3: Web3): Contract<ContractAbi> => {
    return getEVMContract(multiContractCallAbi, address, web3);
}