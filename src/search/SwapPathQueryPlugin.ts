import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import BigNumber from "bignumber.js"
import { amount2Decimal, getSwapTokenAddress, point2PriceDecimal, TokenInfoFormatted } from "../base"
import { CallingProperty, Path, PathQuery, PathQueryCalling, PathQueryResult, PreQueryResult, SwapDirection } from "./types"
import { getQuoterContract } from "../quoter"

export class SwapPathQueryPlugin {

    private preQueryResult: PreQueryResult
    private chainId: number
    private quoterContract: Contract
    private quoterContractAddress: string

    private direction: SwapDirection = undefined as unknown as SwapDirection
    private tokenIn: TokenInfoFormatted = undefined as unknown as TokenInfoFormatted

    private web3: Web3

    public constructor(
        preQueryResult: PreQueryResult, 
        chainId: number,
        quoterAddress: string,
        web3: Web3
    ) {
        this.preQueryResult = preQueryResult
        this.chainId = chainId
        this.quoterContractAddress = quoterAddress
        this.quoterContract = getQuoterContract(quoterAddress, web3)
        this.web3 = web3
    }
    
    private num2Hex(n: number): string {
        if (n < 10) {
            return String(n);
        }
        const str = 'ABCDEF';
        return str[n - 10];
    }

    private fee2Hex(fee: number): string {
        const n0 = fee % 16;
        const n1 = Math.floor(fee / 16) % 16;
        const n2 = Math.floor(fee / 256) % 16;
        const n3 = Math.floor(fee / 4096) % 16;
        const n4 = 0;
        const n5 = 0;
        return '0x' + this.num2Hex(n5) + this.num2Hex(n4) + this.num2Hex(n3) + this.num2Hex(n2) + this.num2Hex(n1) + this.num2Hex(n0);
    }

    private appendHex(hexString: string, newHexString: string): string {
        return hexString + newHexString.slice(2);
    }

    private getTokenChainPath(tokenChain: TokenInfoFormatted[], feeChain: number[]): string {
        let hexString = tokenChain[0].wrapTokenAddress ?? tokenChain[0].address
        for (let i = 0; i < feeChain.length; i++) {
            hexString = this.appendHex(hexString, this.fee2Hex(feeChain[i]))
            hexString = this.appendHex(hexString, tokenChain[i + 1].wrapTokenAddress ?? tokenChain[i + 1].address)
        }
        return hexString
    }
    private getTokenChainPathReverse(tokenChain: TokenInfoFormatted[], feeChain: number[]): string {
        let hexString = tokenChain[tokenChain.length - 1].wrapTokenAddress ?? tokenChain[tokenChain.length - 1].address
        for (let i = feeChain.length - 1; i >= 0; i--) {
            hexString = this.appendHex(hexString, this.fee2Hex(feeChain[i]))
            hexString = this.appendHex(hexString, tokenChain[i].wrapTokenAddress ?? tokenChain[i].address)
        }
        return hexString
    }

    private reverse(path: Path): Path {
        return {
            ...path,
            tokenChain: path.tokenChain.slice().reverse(),
            feeContractNumber: path.feeContractNumber.slice().reverse()
        }
    }

    public getPathQuery(tokenIn: TokenInfoFormatted, tokenOut: TokenInfoFormatted, direction: SwapDirection, amount: string): PathQuery[] {

        this.tokenIn = tokenIn
        this.direction = direction

        const preQueryResult = this.preQueryResult as PreQueryResult
        const pathQuery = [] as PathQuery[]
        for (const path of preQueryResult.pathWithOutFee100) {
            const p = (path.tokenChain[0].symbol === tokenIn.symbol) ? path : this.reverse(path)
            const pathChain = (direction === SwapDirection.ExactIn) ? this.getTokenChainPath(p.tokenChain, p.feeContractNumber) : this.getTokenChainPathReverse(p.tokenChain, p.feeContractNumber)
            const calling = (direction === SwapDirection.ExactIn) ? this.quoterContract.methods.swapAmount(amount, pathChain) : this.quoterContract.methods.swapDesire(amount, pathChain)
            pathQuery.push({
                path: p,
                pathQueryCalling: {
                    calling: calling.encodeABI(),
                    targetAddress: this.quoterContractAddress,
                    callingProperty: CallingProperty.Short
                } as PathQueryCalling
            } as PathQuery)
        }

        for (const path of preQueryResult.pathWithFee100) {
            const p = (path.tokenChain[0].symbol === tokenIn.symbol) ? path : this.reverse(path)
            const pathChain = (direction === SwapDirection.ExactIn) ? this.getTokenChainPath(p.tokenChain, p.feeContractNumber) : this.getTokenChainPathReverse(p.tokenChain, p.feeContractNumber)
            const calling = (direction === SwapDirection.ExactIn) ? this.quoterContract.methods.swapAmount(amount, pathChain) : this.quoterContract.methods.swapDesire(amount, pathChain)
            pathQuery.push({
                path: p,
                pathQueryCalling: {
                    calling: calling.encodeABI(),
                    targetAddress: this.quoterContractAddress,
                    callingProperty: CallingProperty.Long
                } as PathQueryCalling
            } as PathQuery)
        }
        
        return pathQuery
    }

    private noSufficientLiquidity(path: Path, pointAfterList: number[]): boolean {
        for (let i = 0; i < path.feeContractNumber.length; i++) {
            const tokenA = path.tokenChain[i]
            const tokenB = path.tokenChain[i + 1]
            const tokenAAddress = getSwapTokenAddress(tokenA)
            const tokenBAddress = getSwapTokenAddress(tokenB)
            if (tokenAAddress.toLowerCase() < tokenBAddress.toLowerCase()) {
                // x2y mode
                if (pointAfterList[i] <= -799999) {
                    return true
                }
            } else {
                // y2x mode
                if (pointAfterList[i] >= 799999) {
                    return true
                }
            }
        }
        return false
    }

    private estimateFee(path: Path, inputAmount: number): {feeAmount: number, feeRate: number} {
        let remainAmount = inputAmount
        let remainRate = 1
        for (const fee of path.feeContractNumber) {
            remainAmount = remainAmount - remainAmount * fee / 1e6
            remainRate = remainRate * (1 - fee / 1e6)
        }
        return {feeAmount: inputAmount - remainAmount, feeRate: 1 - remainRate}
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
    private getOriginPointList(path: Path): number[] {
        const ret = [] as number[]
        const preQueryResult = this.preQueryResult as PreQueryResult
        for (let i = 0; i < path.feeContractNumber.length; i ++) {
            const tokenA = path.tokenChain[i]
            const tokenB = path.tokenChain[i + 1]
            const fee = path.feeContractNumber[i]
            const swapPoolKey = this.getSwapPoolKey(tokenA, tokenB, fee)
            const point = preQueryResult.poolPoint.get(swapPoolKey) as number
            ret.push(point)
        }
        return ret
    }
    
    private getPriceDecimalEndByStart(path: Path, pointList: number[]): number {
        let decimalPriceEndByStart = 1
        for (let i = 0; i < path.feeContractNumber.length; i++) {
            if (!pointList[i] && pointList[i] !== 0) {
                return undefined as unknown as number
            }
            const decimalPriceBackByFront = point2PriceDecimal(path.tokenChain[i + 1], path.tokenChain[i], pointList[i])
            decimalPriceEndByStart *= decimalPriceBackByFront
        }
        return decimalPriceEndByStart
    }

    public parseCallingResponse(path: Path, direction: SwapDirection, amount: string, result: string): PathQueryResult {
        let responseAmount = '0'
        let pointAfterList = [] as number[]
        if (direction === SwapDirection.ExactIn) {

            const swapAmountRes = this.web3.eth.abi.decodeParameter(
                {
                    "acquire": "uint256",
                    "pointAfterList": "int24[]"
                },
                result
            ) as any
            responseAmount = swapAmountRes["acquire"]
            pointAfterList = swapAmountRes["pointAfterList"].map((e: any)=>Number(e))
        } else {
            const swapDesireRes = this.web3.eth.abi.decodeParameter(
                {
                    "cost": "uint256",
                    "pointAfterList": "int24[]"
                },
                result
            ) as any
            responseAmount = swapDesireRes["cost"]
            pointAfterList = swapDesireRes["pointAfterList"].slice().reverse().map((e: any) => Number(e))
        }
        const noSufficientLiquidity = this.noSufficientLiquidity(path, pointAfterList)
        const inputAmount = (this.direction === SwapDirection.ExactIn) ? amount : responseAmount
        const inputAmountDecimal = Number(amount2Decimal(new BigNumber(inputAmount), this.tokenIn))
        const {feeAmount: feesDecimal, feeRate} = this.estimateFee(path, inputAmountDecimal)
        const pointBeforeList = this.getOriginPointList(path)

        const initDecimalPriceEndByStart = this.getPriceDecimalEndByStart(path, pointBeforeList)

        const afterDecimalPriceEndByStart = this.getPriceDecimalEndByStart(path, pointAfterList)
        const impact = Math.abs((afterDecimalPriceEndByStart - initDecimalPriceEndByStart) / initDecimalPriceEndByStart)
        const priceImpact = impact
        return {
            amount: responseAmount,
            path,
            noSufficientLiquidity,
            initDecimalPriceEndByStart,
            priceImpact,
            feesDecimal,
            feeRate,
        } as PathQueryResult
    }

}