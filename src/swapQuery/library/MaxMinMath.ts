import JSBI from "jsbi";

export namespace MaxMinMath {

    export function min(a: JSBI, b: JSBI): JSBI {
        return JSBI.greaterThan(a, b) ? b : a;
    }

    export function max(a: JSBI, b: JSBI): JSBI {
        return JSBI.greaterThan(a, b) ? a : b;
    }

}