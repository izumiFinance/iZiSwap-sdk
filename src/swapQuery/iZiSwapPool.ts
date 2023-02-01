import JSBI from "jsbi"
import { Consts } from "./library/consts"
import { Orders } from "./library/Orders"
import { SwapQuery } from "./library/State"

export class iZiSwapPool {
    
    private readonly _state: SwapQuery.State
    public readonly orders: Orders.Orders

    public readonly leftMostPt: number
    public readonly rightMostPt: number

    public readonly sqrtRate_96: JSBI
    public readonly pointDelta: number

    // feetier = fee / 1e6
    // 3000 means 0.3%
    public readonly fee: number

    public constructor(
        state: SwapQuery.State,
        orders: Orders.Orders,
        sqrtRate_96: JSBI,
        pointDelta: number,
        fee: number,
    ) {
        this._state = {...state}
        this.orders = orders
        this.sqrtRate_96 = sqrtRate_96
        this.pointDelta = pointDelta
        this.rightMostPt = Math.floor(Consts.RIGHT_MOST_PT / this.pointDelta) * this.pointDelta
        this.leftMostPt = -this.rightMostPt
        this.fee = fee
    }

    public get state(): SwapQuery.State {
        return {... this._state}
    }

}