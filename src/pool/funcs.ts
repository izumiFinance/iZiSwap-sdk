import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { getEVMContract } from "../base/utils"
import poolAbi from './poolAbi.json'
import factoryAbi from './factoryAbi.json'
import { State } from "./types"
import { pointDeltaRoundingDown, pointDeltaRoundingUp } from "../base"
import JSBI from "jsbi"
import invariant from "tiny-invariant"

export const getPoolContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(poolAbi, address, web3);
}

export const getFactoryContract = (address: string, web3: Web3): Contract => {
    return getEVMContract(factoryAbi, address, web3);
}


export const getPointDelta = async (pool: Contract) : Promise<number> => {
    const pointDelta = Number(await pool.methods.pointDelta().call())
    return pointDelta
}

export const getPoolState = async (pool: Contract) : Promise<State> => {
    const {
        sqrtPrice_96, currentPoint, observationCurrentIndex, observationQueueLen, observationNextQueueLen, liquidity, liquidityX
    } = await pool.methods.state().call()
    return {
        sqrtPrice_96: sqrtPrice_96.toString(),
        currentPoint: Number(currentPoint),
        observationCurrentIndex: Number(observationCurrentIndex),
        observationQueueLen: Number(observationQueueLen),
        observationNextQueueLen: Number(observationNextQueueLen),
        liquidity: liquidity.toString(),
        liquidityX: liquidityX.toString()
    }
}

export const getRawDeltaLiquidities = async (pool: Contract, leftPoint: number, rightPoint: number, pointDelta: number): Promise<{deltaLiquidities: JSBI[], point: number[]}> => {
    const leftPointRoundDown = pointDeltaRoundingDown(leftPoint, pointDelta)
    const rightPointRoundUp = pointDeltaRoundingUp(rightPoint, pointDelta)
    const rawDeltaLiquidities = await pool.methods.liquiditySnapshot(leftPointRoundDown, rightPointRoundUp).call()
    const deltaLiquidities = [] as JSBI[]
    const point = [] as number[]
    for (const i in rawDeltaLiquidities) {
        const idx = Number(i)
        const liquidityStr = rawDeltaLiquidities[idx].toString()
        if (liquidityStr !== '0') {
            deltaLiquidities.push(JSBI.BigInt(liquidityStr))
            point.push(leftPointRoundDown + Number(idx * pointDelta))
        }
    }
    return {deltaLiquidities, point}
}

export const getLiquidities = async (pool: Contract, leftPoint: number, rightPoint: number, targetPoint: number, pointDelta: number, targetLiquidity: string, batchSize: number): Promise<{liquidities: JSBI[], point: number[]}> => {
    
    invariant(leftPoint <= targetPoint, "leftPoint greater than targetPoint")
    invariant(rightPoint >= targetPoint, "rightPoint less than or equal to targetPoint")

    const leftPointRoundDown = pointDeltaRoundingDown(leftPoint, pointDelta)
    const rightPointRoundUp = pointDeltaRoundingUp(rightPoint, pointDelta) + pointDelta
    const realRightRoundUp = rightPointRoundUp - pointDelta

    const batchSizeRoundingDown = Math.max(pointDeltaRoundingDown(batchSize, pointDelta), pointDelta)

    const ZERO = JSBI.BigInt(0)
    let preSum = ZERO

    const allLiquidities = [preSum] as JSBI[]
    const allPoint = [leftPointRoundDown] as number[]

    for (let i = leftPointRoundDown; i < rightPointRoundUp; i += batchSizeRoundingDown) {
        const start = i;
        const end = Math.min(start + batchSizeRoundingDown, rightPointRoundUp)
        const {deltaLiquidities, point} = await getRawDeltaLiquidities(pool, start, end, pointDelta)
        for (let idx = 0; idx < deltaLiquidities.length; idx ++) {
            if (point[idx] > leftPointRoundDown) {
                preSum = JSBI.add(preSum, deltaLiquidities[idx])
                allLiquidities.push(preSum)
                allPoint.push(point[idx])
            }
        }
    }
    if (allPoint[allPoint.length] < realRightRoundUp) {
        allPoint.push(realRightRoundUp)
        allLiquidities.push(preSum)
    }

    const currentLiquidity = JSBI.BigInt(targetLiquidity)
    let currentDeltaLiquidity = JSBI.BigInt(0)
    for (let i = 0; i < allPoint.length; i ++) {
        if (allPoint[i] <= targetPoint && (i + 1 === allPoint.length || allPoint[i + 1] > targetPoint)) {
            currentDeltaLiquidity = JSBI.subtract(currentLiquidity, allLiquidities[i])
        }
    }
    for (let i = 0; i < allPoint.length; i ++) {
        allLiquidities[i] = JSBI.add(allLiquidities[i], currentDeltaLiquidity)
    }

    return {liquidities: allLiquidities, point: allPoint}

}

export const getLimitOrders = async (pool: Contract, leftPoint: number, rightPoint: number, pointDelta: number, batchSize: number): Promise<{sellingX: JSBI[], sellingXPoint: number[], sellingY: JSBI[], sellingYPoint: number[]}> => {
    const leftPointRoundDown = pointDeltaRoundingDown(leftPoint, pointDelta)
    const rightPointRoundUp = pointDeltaRoundingUp(rightPoint, pointDelta) + pointDelta
    const realRightRoundUp = rightPointRoundUp - pointDelta
    const batchSizeRoundingDown = Math.max(pointDeltaRoundingDown(batchSize, pointDelta), pointDelta)
    const sellingX = [] as JSBI[]
    const sellingY = [] as JSBI[]
    const sellingXPoint = [] as number[]
    const sellingYPoint = [] as number[]
    for (let i = leftPointRoundDown; i < rightPointRoundUp; i += batchSizeRoundingDown) {
        const start = i;
        const end = Math.min(start + batchSizeRoundingDown, rightPointRoundUp)
        const rawData = await pool.methods.limitOrderSnapshot(start, end).call()
        for (let j = 0; j < rawData.length; j ++) {
            const sellingXStr = rawData[j].sellingX.toString()
            const sellingYStr = rawData[j].sellingY.toString()
            if (sellingYStr !== '0' || i === leftPointRoundDown && j === 0) {
                sellingY.push(JSBI.BigInt(sellingYStr))
                sellingYPoint.push(start + j * pointDelta)
            }
            if (sellingXStr !== '0') {
                sellingX.push(JSBI.BigInt(sellingXStr))
                sellingXPoint.push(start + j * pointDelta)
            }
        }
    }
    if (sellingXPoint[sellingXPoint.length - 1] < realRightRoundUp) {
        sellingX.push(JSBI.BigInt(0))
        sellingXPoint.push(realRightRoundUp)
    }
    return {
        sellingX,
        sellingXPoint,
        sellingY,
        sellingYPoint
    }
}