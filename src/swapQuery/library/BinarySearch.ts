export namespace BinarySearch {

    export enum FindLeftOperator {
        LESS_THAN = 0,
        LESS_THAN_OR_EQUAL = 1,
    }
    export enum FindRightOperator {
        GREATER_THAN = 0,
        GREATER_THAN_OR_EQUAL = 1,
    }

    export function isLeft(target: number, input: number, opt: FindLeftOperator) : boolean {
        if (opt === FindLeftOperator.LESS_THAN) {
            return target < input
        }
        return target <= input
    }

    export function isRight(target: number, input: number, opt: FindRightOperator): boolean {
        if (opt === FindRightOperator.GREATER_THAN) {
            return target > input
        }
        return target >= input
    }

    export function findLeft(array: number[], input: number, opt: FindLeftOperator): number {
        if (!isLeft(array[0], input, opt)) {
            return -1
        }
        if (isLeft(array[array.length - 1], input, opt)) {
            return array.length - 1
        }
        let l = 0
        let r = array.length - 1
        while (l + 1 < r) {
            const mid = Math.floor((l + r) / 2)
            if (isLeft(array[mid], input, opt)) {
                l = mid
            } else {
                r = mid
            }
        }
        return l
    }

    export function findRight(array: number[], input: number, opt: FindRightOperator): number {
        if (!isRight(array[array.length - 1], input, opt)) {
            return array.length
        }
        if (isRight(array[0], input, opt)) {
            return 0;
        }
        let l = 0
        let r = array.length - 1
        while (l + 1 < r) {
            const mid = Math.floor((l + r) / 2)
            if (isRight(array[mid], input, opt)) {
                r = mid
            } else {
                l = mid
            }
        }
        return l
    }


}