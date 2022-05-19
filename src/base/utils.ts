import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";

export const getEVMContract = (
    abi: any,
    address: string,
    web3: Web3
): Contract => {
    return new web3!.eth.Contract(abi as unknown as AbiItem, address, {});
};