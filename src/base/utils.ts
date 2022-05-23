import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { TokenInfoFormatted } from "./types";
import {BigNumber} from 'bignumber.js'

export const getEVMContract = (
    abi: any,
    address: string,
    web3: Web3
): Contract => {
    return new web3!.eth.Contract(abi as unknown as AbiItem, address, {});
}

function num2Hex(n: number) {
    if (n < 10) {
        return String(n);
    }
    const str = 'ABCDEF';
    return str[n - 10];
}

function fee2Hex(fee: number): string {
    const n0 = fee % 16;
    const n1 = Math.floor(fee / 16) % 16;
    const n2 = Math.floor(fee / 256) % 16;
    const n3 = Math.floor(fee / 4096) % 16;
    const n4 = 0;
    const n5 = 0;
    return '0x' + num2Hex(n5) + num2Hex(n4) + num2Hex(n3) + num2Hex(n2) + num2Hex(n1) + num2Hex(n0);
}

function appendHex(hexString: string, newHexString: string): string {
    return hexString + newHexString.slice(2);
}

export const getTokenChainPath = (tokenChain: TokenInfoFormatted[], feeChain: number[]): string => {
    let hexString = tokenChain[0].address
    for (let i = 0; i < feeChain.length; i ++) {
        hexString = appendHex(hexString, fee2Hex(feeChain[i]))
        hexString = appendHex(hexString, tokenChain[i + 1].address)
    }
    return hexString
}

export const getTokenChainPathReverse = (tokenChain: TokenInfoFormatted[], feeChain: number[]): string => {
    let hexString = tokenChain[tokenChain.length - 1].address
    for (let i = feeChain.length - 1; i >= 0; i ++) {
        hexString = appendHex(hexString, fee2Hex(feeChain[i]))
        hexString = appendHex(hexString, tokenChain[i].address)
    }
    return hexString
}
