import JSBI from 'jsbi'

export abstract class MulDivMath {

    /**
    * Cannot be constructed.
    */
    private constructor() {}

    public static mulDivFloor(a: JSBI, b: JSBI, c: JSBI):JSBI {
        return JSBI.divide(JSBI.multiply(a, b), c)
    }

    public static mulDivCeil(a: JSBI, b: JSBI, c: JSBI):JSBI {
        const mul = JSBI.multiply(a, b)
        const divFloor = JSBI.divide(mul, c)
        const mulRecover = JSBI.multiply(divFloor, c)
        if (JSBI.GT(mul, mulRecover)) {
            return JSBI.add(divFloor, JSBI.BigInt(1))
        }
        return divFloor;
    }
}
