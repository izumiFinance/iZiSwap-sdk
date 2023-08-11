import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { isAddress } from "@ethersproject/address"
import BigNumber from "bignumber.js"
import { getSwapTokenAddress, TokenInfoFormatted } from "../base"
import { DagNode, initiZiPreResult, Path, PoolPair, PreQueryResult } from "./types"
import { getLiquidityManagerContract } from "../liquidityManager"
import { getPoolContract } from "../pool"


interface Link {
    tokenB: TokenInfoFormatted;
    feeContractNumber: number;
}

const stateParams = [
    {
        "internalType": "uint160",
        "name": "sqrtPrice_96",
        "type": "uint160"
    },
    {
        "internalType": "int24",
        "name": "currentPoint",
        "type": "int24"
    },
    {
        "internalType": "uint16",
        "name": "observationCurrentIndex",
        "type": "uint16"
    },
    {
        "internalType": "uint16",
        "name": "observationQueueLen",
        "type": "uint16"
    },
    {
        "internalType": "uint16",
        "name": "observationNextQueueLen",
        "type": "uint16"
    },
    {
        "internalType": "bool",
        "name": "locked",
        "type": "bool"
    },
    {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
    },
    {
        "internalType": "uint128",
        "name": "liquidityX",
        "type": "uint128"
    }
]

export class SwapPreQueryPlugin {

    private preQueryResult: PreQueryResult
    private web3: Web3

    private chainId: number
    private liquidityManagerContract: Contract
    private liquidityManagerAddress: string
    // only for encode abi of calling and decode method result
    private fakePoolContract: Contract

    private poolBlackSet: Set<string>
    private midTokenList: TokenInfoFormatted[]
    private supportFeeContractNumbers: number[]
    private support001PoolSet: Set<string>

    private pairsOfCalling: PoolPair[] = undefined as unknown as PoolPair[]
    private knownPairs: PoolPair[] = undefined as unknown as PoolPair[]
    private knownPoolAddress: string[] = undefined as unknown as string[]


    private knownPoolPoint: number[] = undefined as unknown as number[]
    private unknownPoolPoint: number[] = undefined as unknown as number[]
    
    private allLinks: Link[] = undefined as unknown as Link[]

    private dagNodes: DagNode[] = undefined as unknown as DagNode[]
    private responsePoolAddress: string[] = undefined as unknown as string[]

    private tokenA: TokenInfoFormatted = undefined as unknown as TokenInfoFormatted
    private tokenB: TokenInfoFormatted = undefined as unknown as TokenInfoFormatted

    public constructor(
        preQueryResult: PreQueryResult, 
        liquidityManagerAddress: string,
        chainId: number, 
        web3: Web3
    ) {
        this.web3 = web3
        if (preQueryResult.lastChainId === chainId) {
            this.preQueryResult = {...preQueryResult}
        } else {
            this.preQueryResult = initiZiPreResult(chainId)
        }
        this.chainId = chainId
        this.liquidityManagerAddress = liquidityManagerAddress
        this.liquidityManagerContract = getLiquidityManagerContract(this.liquidityManagerAddress, web3)
        this.fakePoolContract = getPoolContract(
            liquidityManagerAddress,
            web3,
        )
        this.poolBlackSet = new Set<string>()
        this.support001PoolSet = new Set<string>()
        this.midTokenList = []
        this.supportFeeContractNumbers = []
    }

    public setPoolBlackList(poolBlackList: PoolPair[]) {
        this.poolBlackSet.clear()
        for (const pool of poolBlackList) {
            this.poolBlackSet.add(this.getSwapPoolKey(pool.tokenA, pool.tokenB, pool.feeContractNumber))
        }
    }
    public setMidTokenList(midTokenList: TokenInfoFormatted[]) {
        this.midTokenList = midTokenList
    }
    public setSupportFeeContractNumbers(supportFeeContractNumbers: number[]) {
        this.supportFeeContractNumbers = supportFeeContractNumbers
    }
    public setSupport001Pools(support001Pools: PoolPair[]) {
        this.support001PoolSet.clear()
        for (const pool of support001Pools) {
            this.support001PoolSet.add(this.getSwapPoolKey(pool.tokenA, pool.tokenB, pool.feeContractNumber))
        }
    }

    private getSwapPoolKey(tokenA: TokenInfoFormatted, tokenB: TokenInfoFormatted, feeContractNumber: number) : string {
        const tokenASymbol = tokenA.symbol.toUpperCase()
        const tokenBSymbol = tokenB.symbol.toUpperCase()
        if (tokenASymbol < tokenBSymbol) {
            return tokenASymbol + '-' + tokenBSymbol + '-' + String(feeContractNumber)
        } else {
            return tokenBSymbol + '-' + tokenASymbol + '-' + String(feeContractNumber)
        }
    }

    private getSwapPoolKeySymbol(tokenASymbol: string, tokenBSymbol: string, feeContractNumber: number): string {
        const a = tokenASymbol.toUpperCase()
        const b = tokenBSymbol.toUpperCase()
        if (a < b) {
            return a + '-' + b + '-' + String(feeContractNumber)
        } else {
            return b + '-' + a + '-' + String(feeContractNumber)
        }
    }

    private hasPool(tokenA: TokenInfoFormatted, tokenB: TokenInfoFormatted, feeContractNumber: number) : boolean {
        const lastPreQueryResult = this.preQueryResult
        if (this.chainId != lastPreQueryResult.lastChainId) {
            return false
        }
        const key = this.getSwapPoolKey(tokenA, tokenB, feeContractNumber)
        return lastPreQueryResult.pool.has(key)
    }
    private blackPool(tokenA: TokenInfoFormatted, tokenB: TokenInfoFormatted, feeContractNumber: number) : boolean {
        const poolKey = this.getSwapPoolKey(tokenA, tokenB, feeContractNumber)
        return this.poolBlackSet.has(poolKey)
    }

    public getPreQueryDag(
        tokenA: TokenInfoFormatted, 
        tokenB: TokenInfoFormatted,
    ) : DagNode[] {

        this.tokenA = tokenA
        this.tokenB = tokenB

        const tokenBList: TokenInfoFormatted[] = []
        this.midTokenList.forEach((s)=>{
            if (s.symbol === tokenA.symbol || s.symbol === tokenB.symbol) {
                return
            }
            tokenBList.push(s)
        })

        this.allLinks = []

        for (const tokenB of tokenBList) {
            for (const feeContractNumber of this.supportFeeContractNumbers) {
                this.allLinks.push({
                    tokenB,
                    feeContractNumber
                })
            }
        }

        tokenBList.push({...tokenA})
        tokenBList.push({...tokenB})


        this.pairsOfCalling = []
        this.knownPairs = []

        const poolCalling = [] as string[]

        // pool address calling
        for (let i = 0; i < tokenBList.length; i ++) {
            for (let j = i + 1; j < tokenBList.length; j ++) {
                for (const feeContractNumber of this.supportFeeContractNumbers) {
                    if (this.blackPool(tokenBList[i], tokenBList[j], feeContractNumber)) {
                        continue
                    }
                    if (!this.hasPool(tokenBList[i], tokenBList[j], feeContractNumber)) {
                        poolCalling.push(this.liquidityManagerContract.methods.pool(getSwapTokenAddress(tokenBList[i]), getSwapTokenAddress(tokenBList[j]), feeContractNumber).encodeABI())
                        this.pairsOfCalling.push({
                            tokenA: tokenBList[i],
                            tokenB: tokenBList[j],
                            feeContractNumber
                        } as PoolPair)
                    } else {
                        this.knownPairs.push({
                            tokenA: tokenBList[i],
                            tokenB: tokenBList[j],
                            feeContractNumber
                        } as PoolPair)
                    }
                }
            }
        }
        this.responsePoolAddress = []
        this.unknownPoolPoint = []
        for (let i = 0; i < this.pairsOfCalling.length; i ++) {
            this.responsePoolAddress.push('')
            this.unknownPoolPoint.push(0)
        }
        const preQueryResult = this.preQueryResult as PreQueryResult

        const poolCallingNodes: DagNode[] = poolCalling.map((calling: string, idx: number)=>{
            return {
                calling,
                preIdx: undefined,
                targetAddress: this.liquidityManagerAddress,
                parseCallingResponse: (response: string): void => {
                    const address = this.web3.eth.abi.decodeParameter(
                        "address",
                        response
                    ) as unknown as string
                    this.responsePoolAddress[idx] = address
                }
            } as DagNode
        })

        const knownPairStateCalling = [] as string[]
        this.knownPoolPoint = []
        for (let i = 0; i < this.knownPairs.length; i ++) {
            this.knownPoolPoint.push(0)
        }
        // state calling of known pairs
        this.knownPoolAddress = []
        for (const pair of this.knownPairs) {
            const poolKey = this.getSwapPoolKey(pair.tokenA, pair.tokenB, pair.feeContractNumber)
            const poolAddress = preQueryResult.pool.get(poolKey) as string
            knownPairStateCalling.push(this.fakePoolContract.methods.state().encodeABI())
            this.knownPoolAddress.push(poolAddress)
        }

        const knownPairStateCallingNodes: DagNode[] = knownPairStateCalling.map((calling: string, idx: number)=>{
            const poolAddress = this.knownPoolAddress[idx]
            return {
                calling,
                preIdx: undefined,
                targetAddress: poolAddress,
                parseCallingResponse: (response: string): void => {
                    const state = this.web3.eth.abi.decodeParameters(
                        stateParams,
                        response
                    ) as any
                    this.knownPoolPoint[idx] = Number(state["currentPoint"])
                }
            }
        })

        // state calling of unknown pairs
        const unknownPairStateCallingNodes: DagNode[] = this.pairsOfCalling.map((poolPair: PoolPair, idx: number) => {
            return {
                preIdx: [idx],
                getCallingAndTargetAddress: (): {targetAddress: string, calling: string} => {
                    const poolAddress = this.responsePoolAddress[idx]
                    if (!isAddress(poolAddress) || new BigNumber(poolAddress).eq(0)) {
                        return undefined as unknown as {targetAddress: string, calling: string}
                    }
                    const calling = this.fakePoolContract.methods.state().encodeABI()
                    return {targetAddress: poolAddress, calling}
                },
                parseCallingResponse: (response: string): void => {

                    const state = this.web3.eth.abi.decodeParameters(
                        stateParams,
                        response
                    ) as any
                    this.unknownPoolPoint[idx] = Number(state["currentPoint"])
                }
            }
        })

        this.dagNodes = [...poolCallingNodes, ...knownPairStateCallingNodes, ...unknownPairStateCallingNodes]

        return this.dagNodes

    }

    public getQueryResult(): PreQueryResult {
        const lastPreQueryResult = this.preQueryResult as PreQueryResult
        const preQueryResult = {
            pathWithFee100: [],
            pathWithOutFee100: [],
            lastChainId: lastPreQueryResult.lastChainId,
            pool: lastPreQueryResult.pool,
            poolPoint: lastPreQueryResult.poolPoint
        } as PreQueryResult
        if (preQueryResult.lastChainId !== this.chainId) {
            preQueryResult.pool = new Map<string, string>()
            preQueryResult.poolPoint = new Map<string, number>()
        } else if (preQueryResult.lastChainId === this.chainId && this.dagNodes.length === 0) {
            preQueryResult.pathWithFee100 = lastPreQueryResult.pathWithFee100
            preQueryResult.pathWithOutFee100 = lastPreQueryResult.pathWithOutFee100
            // no new prequerys
            return preQueryResult
        }
        for (let i = 0; i < this.responsePoolAddress.length; i ++) {
            if (this.responsePoolAddress[i] === '') {
                continue
            }
            const poolAddress = this.responsePoolAddress[i]
            if (!isAddress(poolAddress) || new BigNumber(poolAddress).eq(0)) {
                continue
            }
            const poolPair = this.pairsOfCalling[i]

            const poolKey = this.getSwapPoolKey(poolPair.tokenA, poolPair.tokenB, poolPair.feeContractNumber)
            preQueryResult.pool.set(poolKey, poolAddress)

            preQueryResult.poolPoint.set(poolKey, this.unknownPoolPoint[i])
        }

        for (let i = 0; i < this.knownPairs.length; i ++) {
            const poolPair = this.knownPairs[i]
            const poolKey = this.getSwapPoolKey(poolPair.tokenA, poolPair.tokenB, poolPair.feeContractNumber)
            preQueryResult.poolPoint.set(poolKey, this.knownPoolPoint[i])
        }

        const paths = [] as Path[]

        for (const i in this.allLinks) {
            const firstKey = this.getSwapPoolKey(this.tokenA, this.allLinks[i].tokenB, this.allLinks[i].feeContractNumber)
            if (!preQueryResult.pool.has(firstKey)) {
                continue
            }
            if (this.poolBlackSet.has(firstKey)) {
                continue
            }
            for (const j in this.allLinks) {
                const lastKey = this.getSwapPoolKey(this.allLinks[j].tokenB, this.tokenB, this.allLinks[j].feeContractNumber)
                if (!preQueryResult.pool.has(lastKey)) {
                    continue
                }
                if (this.poolBlackSet.has(lastKey)) {
                    continue
                }
                if (this.allLinks[i].tokenB.symbol === this.allLinks[j].tokenB.symbol) {
                    const feeAB = this.allLinks[i].feeContractNumber
                    const feeBC = this.allLinks[j].feeContractNumber
                    paths.push({
                        tokenChain: [{...this.tokenA}, {...this.allLinks[i].tokenB}, {...this.tokenB}],
                        feeContractNumber: [feeAB, feeBC]
                    } as Path)
                } else {

                    for (const middleFeeContractNumber of this.supportFeeContractNumbers) {
                        const middleKey = this.getSwapPoolKey(this.allLinks[i].tokenB, this.allLinks[j].tokenB, middleFeeContractNumber)
                        if (!preQueryResult.pool.has(middleKey)) {
                            continue
                        }
                        if (this.poolBlackSet.has(middleKey)) {
                            continue
                        }
                        paths.push({
                            tokenChain: [{...this.tokenA}, {...this.allLinks[i].tokenB}, {...this.allLinks[j].tokenB}, {...this.tokenB}],
                            feeContractNumber: [this.allLinks[i].feeContractNumber, middleFeeContractNumber, this.allLinks[j].feeContractNumber]
                        } as Path)
                    }
                    
                }
            }
        }


        for (const feeContractNumber of this.supportFeeContractNumbers) {
            const directKey = this.getSwapPoolKey(this.tokenA, this.tokenB, feeContractNumber)
            if (!preQueryResult.pool.has(directKey)) {
                continue
            }
            if (this.poolBlackSet.has(directKey)) {
                continue
            }
            paths.push({
                tokenChain: [{...this.tokenA}, {...this.tokenB}],
                feeContractNumber: [feeContractNumber]
            } as Path)
        }

        const pathWithoutFee100 = [] as Path[];
        const pathWithFee100 = [] as Path[];
        
        for (const path of paths) {
            let noFee100Pool = true
            let validFee100Pool = true
            for (let i=0; i<path.feeContractNumber.length; i ++) {
                const fee = path.feeContractNumber[i];
                if (fee === 100) {
                    noFee100Pool = false
                    const tokenA = path.tokenChain[i];
                    const tokenB = path.tokenChain[i+1];
                    const poolKey = this.getSwapPoolKey(tokenA, tokenB, fee)
                    if (!this.support001PoolSet.has(poolKey)) {
                        validFee100Pool = false
                        break
                    }
                }
            }
            if (noFee100Pool) {
                pathWithoutFee100.push(path)
            } else {
                if (validFee100Pool) {
                    pathWithFee100.push(path)
                }
            }
        }

        preQueryResult.pathWithFee100 = pathWithFee100
        preQueryResult.pathWithOutFee100 = pathWithoutFee100

        return preQueryResult
    }

}
