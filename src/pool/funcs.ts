import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { getEVMContract } from "../base/utils"
import poolAbi from './poolAbi.json'
import factoryAbi from './factoryAbi.json'
import { TokenInfoFormatted } from "../base/types"
import { State } from "./types"

export const getPoolContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(poolAbi, address, web3);
}

export const getFactoryContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(factoryAbi, address, web3);
}

export const getTokenXYOfPool = async (pool: Contract) : Promise<{tokenX: string, tokenY: string}> => {
    const tokenX = await pool.methods.tokenX().call()
    const tokenY = await pool.methods.tokenY().call()
    return {tokenX,tokenY}
}

export const getPoolAddress = async (
    factory: Contract, 
    tokenA: TokenInfoFormatted, 
    tokenB: TokenInfoFormatted, 
    fee: number) : Promise<string> => {
    const poolAddress = await factory.methods.pool(tokenA.address, tokenB.address, fee).call()
    return poolAddress
}

export const getTickSpacing = async (pool: Contract) : Promise<number> => {
    const tickSpacing = await pool.methods.pointDelta().call()
    return tickSpacing
}

export const getPoolState = async (pool: Contract) : Promise<State> => {
    const {
        sqrtPrice_96, currentPoint, observationCurrentIndex, observationQueueLen, observationNextQueueLen, liquidity, liquidityX
    } = await pool.methods.state().call()
    return {
        sqrtPrice_96: sqrtPrice_96.toString(),
        currentPoint,
        observationCurrentIndex,
        observationQueueLen,
        observationNextQueueLen,
        liquidity: liquidity.toString(),
        liquidityX: liquidityX.toString()
    }
}