import JSBI from "jsbi"
import { Orders } from "./library/Orders"
import { SwapQuery } from "./library/State"

export class iZiSwapPool {
    
    private readonly LEFT_MOST_PT: number
    private readonly RIGHT_MOST_PT: number

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
        this.LEFT_MOST_PT = -800000
        this.RIGHT_MOST_PT = 800000
        this.leftMostPt = this.LEFT_MOST_PT
        this.rightMostPt = this.RIGHT_MOST_PT
        this._state = state
        this.sqrtRate_96 = sqrtRate_96
        this.pointDelta = pointDelta
        this.orders = orders
        this.fee = fee
    }

    public get state(): SwapQuery.State {
        return {... this._state}
    }

}