import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { getEVMContract } from "../base/utils"
import liquidityManagerAbi from './abi.json'

import {BigNumber} from 'bignumber.js'
import { TokenInfoFormatted } from "../base/types"

export const getLiquidityManagerContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(liquidityManagerAbi, address, web3);
}
