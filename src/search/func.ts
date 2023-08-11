import { doPathQuery, doPreQuery } from "./controllers"
import { initiZiPreResult, PathQueryParams, PathQueryResult, PreQueryParams, PreQueryResult, SearchPathQueryParams } from "./types"

export const preQuery = async (
    preQueryParams: PreQueryParams,
    preQueryResult?: PreQueryResult
) : Promise<PreQueryResult> => {
    if (!preQueryResult) {
        preQueryResult = initiZiPreResult(preQueryParams.chainId)
    }
    return await doPreQuery(preQueryParams, preQueryResult)
}

export const pathQuery = async (
    pathQueryParams: PathQueryParams,
    preQueryResult: PreQueryResult
) : Promise<PathQueryResult> => {
    return await doPathQuery(pathQueryParams, preQueryResult)
}

export const searchPathQuery = async(
    searchPathQueryParams: SearchPathQueryParams,
    preQueryResult?: PreQueryResult
) : Promise<{pathQueryResult: PathQueryResult, preQueryResult: PreQueryResult}> => {
    const preQueryParams = {...searchPathQueryParams} as PreQueryParams
    preQueryResult = await preQuery(preQueryParams, preQueryResult)
    const pathQueryParams = {...searchPathQueryParams} as PathQueryParams
    const pathQueryResult = await pathQuery(pathQueryParams, preQueryResult)
    return {
        preQueryResult,
        pathQueryResult
    }
}
