import { Contract } from 'web3-eth-contract'
import BigNumber from 'bignumber.js';
import { CallingProperty, DagNode, Path, PathQueryCalling, PathQueryParams, PathQueryResult, PreQueryParams, PreQueryResult, SwapDirection } from './types';
import { SwapPreQueryPlugin } from './SwapPreQueryPlugin';
import { SwapPathQueryPlugin } from './SwapPathQueryPlugin';
import { ContractAbi } from 'web3';

function checkNodeCanVisit(dagNode: DagNode, visited: number): boolean {
    if (!dagNode.preIdx) {
        return true
    }
    const maxIdx = Math.max(...dagNode.preIdx)
    return maxIdx < visited
}

function checkFinish(dagNodes: DagNode[], visited: number): boolean {
    if (visited < dagNodes.length) {
        return false
    }
    return true
}

async function multiQuery(multicall: Contract<ContractAbi>, calling: string[], targetAddress: string[]): Promise<{successes: boolean[], results: string[]}> {
    interface RawResult {
        successes: any
        results: any
    }
    const result = await multicall.methods.multicall(targetAddress, calling).call() as RawResult
    return {
        successes: result.successes,
        results: result.results
    }
}


export const doPreQuery = async (
    params: PreQueryParams,
    preQueryResult: PreQueryResult
): Promise<PreQueryResult> => {
    const {
        chainId,
        web3,
        multicall,
        tokenIn,
        tokenOut,
    } = params
    const preQueryPlugin = new SwapPreQueryPlugin(
        preQueryResult, 
        params.liquidityManagerAddress,
        chainId, 
        web3
    )
    preQueryPlugin.setPoolBlackList(params.poolBlackList)
    preQueryPlugin.setMidTokenList(params.midTokenList)
    preQueryPlugin.setSupportFeeContractNumbers(params.supportFeeContractNumbers)
    preQueryPlugin.setSupport001Pools(params.support001Pools)

    const dagNodes = preQueryPlugin.getPreQueryDag(tokenIn, tokenOut) ?? []
    let visited = 0
    let currentNum = 0

    while (!checkFinish(dagNodes, visited)) {
        let num = 0
        while (num + visited < dagNodes.length) {
            if (!checkNodeCanVisit(dagNodes[num + visited], visited)) {
                break
            } else {
                num ++
            }
        }
        currentNum = num

        const currentNodes = [] as DagNode[]

        for (let j = 0; j < currentNum; j ++) {
            const currentNode = dagNodes[visited + j]
            if (!currentNode.calling || !currentNode.targetAddress) {
                const query = currentNode.getCallingAndTargetAddress!()
                if (query) {
                    currentNode.calling = query.calling
                    currentNode.targetAddress = query.targetAddress
                    currentNodes.push(currentNode)
                }
            } else {
                currentNodes.push(currentNode)
            }
        }

        const targetAddress = currentNodes.map((n)=>n.targetAddress) as string[]
        const calling = currentNodes.map((n)=>n.calling) as string[]
        const {successes, results} = await multiQuery(multicall, calling, targetAddress)


        for (let i = 0; i < successes.length; i ++) {
            if (!successes[i] || results[i] === '0x') {
                continue
            }
            try {
                currentNodes[i].parseCallingResponse(results[i])
            } catch (_) {}
        }
        visited += currentNum

    }

    return preQueryPlugin.getQueryResult()
    
}

function checkNewPathQueryBetter(
    oldPathQuery: PathQueryResult, 
    newPathQuery: PathQueryResult,
    direction: SwapDirection
): boolean {
    if (!newPathQuery) {
        return false
    }
    if (!oldPathQuery) {
        return true
    }
    const newAmount = new BigNumber(newPathQuery.amount)
    const oldAmount = oldPathQuery.amount
    const better = (direction === SwapDirection.ExactIn) ? newAmount.gt(oldAmount) : newAmount.lt(oldAmount)
    return better
}

async function _doPathQuery(
    multicall: Contract<ContractAbi>, 
    callings: PathQueryCalling[],
    callingPath: Path[],
    pathQueryPlugins: SwapPathQueryPlugin,
    direction: SwapDirection,
    amount: string,
    batchSize: number
): Promise<PathQueryResult> {

    let finalPathQueryResult = undefined as unknown as PathQueryResult
    for (let i = 0; i < callings.length; i += batchSize) {
        const end = Math.min(i + batchSize, callings.length)
        const len = end - i
        const batchCallings = callings.slice(i, end)
        const data = batchCallings.map((e)=>e.calling)
        const contracts = batchCallings.map((e)=>e.targetAddress)
        const {successes, results} = await multiQuery(multicall, data, contracts)
        for (let j = 0; j < len; j ++) {
            if (!successes[j] || results[j] === '0x') {
                continue
            }
            const idx = i + j
            const path = callingPath[idx]
            let pathQueryResult = undefined
            try {
                pathQueryResult = pathQueryPlugins.parseCallingResponse(path, direction, amount, results[j])
            } catch (_) {}
            if (!pathQueryResult) {
                continue
            }
            if (!pathQueryResult.noSufficientLiquidity) {
                if (checkNewPathQueryBetter(finalPathQueryResult, pathQueryResult, direction)) {
                    finalPathQueryResult = {...pathQueryResult}
                    finalPathQueryResult.path = path
                }
            }
        }
    }
    return finalPathQueryResult
}

export const doPathQuery = async (
    params: PathQueryParams,
    preQueryResult: PreQueryResult,
): Promise<PathQueryResult> => {

    const {
        chainId,
        quoterAddress,
        web3,
        tokenIn,
        tokenOut,
        amount,
        direction,
        multicall
    } = params

    const shortBatchSize = params.shortBatchSize ?? 20
    const longBatchSize = params.longBatchSize ?? 20
    

    const pathQueryPlugin = new SwapPathQueryPlugin(
        preQueryResult as PreQueryResult, 
        chainId, 
        quoterAddress, 
        web3
    )
    let finalPathQueryResult = undefined as unknown as PathQueryResult

    const longCalling = [] as PathQueryCalling[]
    const shortCalling = [] as PathQueryCalling[]

    const longCallingPath = [] as Path[]
    const shortCallingPath = [] as Path[]

    const pathQueryList = pathQueryPlugin.getPathQuery(
        tokenIn, 
        tokenOut,
        direction, 
        amount
    )
    for (const pathQuery of pathQueryList) {
        if (pathQuery.path.tokenChain[0].symbol !== tokenIn.symbol) {
            continue
        }
        if (pathQuery.path.tokenChain[pathQuery.path.tokenChain.length - 1].symbol !== tokenOut.symbol) {
            continue
        }
        if (!pathQuery.pathQueryResult) {
            const pathQueryCalling = pathQuery.pathQueryCalling
            if (pathQueryCalling?.callingProperty === CallingProperty.Short) {
                shortCalling.push(pathQueryCalling)
                shortCallingPath.push(pathQuery.path)
            } else if (pathQueryCalling?.callingProperty === CallingProperty.Long) {
                longCalling.push(pathQueryCalling)
                longCallingPath.push(pathQuery.path)
            }
        } else if (!pathQuery.pathQueryResult.noSufficientLiquidity) {
            if (checkNewPathQueryBetter(finalPathQueryResult, pathQuery.pathQueryResult, direction)) {
                finalPathQueryResult = {...pathQuery.pathQueryResult}
                finalPathQueryResult.path = pathQuery.path
            }
        }
    }
    
    const shortPathQueryResult = await _doPathQuery(
        multicall, shortCalling, 
        shortCallingPath, pathQueryPlugin, direction, amount, shortBatchSize
    )

    const longPathQueryResult = await _doPathQuery(
        multicall, longCalling, 
        longCallingPath, pathQueryPlugin, direction, amount, longBatchSize
    )

    if (checkNewPathQueryBetter(finalPathQueryResult, shortPathQueryResult, direction)) {
        finalPathQueryResult = {...shortPathQueryResult}
        finalPathQueryResult.path = shortPathQueryResult.path
    }
    if (checkNewPathQueryBetter(finalPathQueryResult, longPathQueryResult, direction)) {
        finalPathQueryResult = {...longPathQueryResult}
        finalPathQueryResult.path = longPathQueryResult.path
    }

    return finalPathQueryResult
}