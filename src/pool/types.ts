export interface BaseState {
    currentPoint: number,
    liquidity: string,
    liquidityX: string
}

export interface State extends BaseState {

    sqrtPrice_96: string,
    observationCurrentIndex: number,
    observationQueueLen: number,
    observationNextQueueLen: number
}