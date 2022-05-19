
export interface TokenInfoFormatted {
    chainId: number;
    name: string;
    symbol: string;
    icon: string;
    address: string;
    decimal: number;
    addTime?: Date;
    custom: boolean;
}

export enum ChainId {
    EthereumMainnet = 1,
    Rinkeby = 4,
    Optimism = 10,
    BSC = 56,
    Gatechain = 86,
    BSCTestnet = 97,
    Heco = 128,
    Matic = 137,
    Fantom = 250,
    Izumi = 1337,
    Arbitrum = 42161,
    MaticTestnet = 80001,
    Harmony = 1666600000,
    HarmonyTestnet = 1666700000,
}


export interface BaseChain {
    id: number;
    name: string;
    tokenSymbol: string;
    token: Partial<TokenInfoFormatted>;
    icon: string;
    scanUrl: string;
    scanName: string;
    vmType: string;
    rpcUrl: string;
    blockDelta?: number; // time for producing a new block
    blockDeltaU?: number; // time for producing a new block average
}


// todo: complete type of fields
export interface TransactionObject {
    from?: any;
    to?: any;
    value?: any;
    gas?: any;
    gasPrice?: any;
    type?: any;
    maxFeePerGas?: string | number;
    maxPriorityFeePerGas?: any;
    accessList?: any;
    data?: any;
    nonce?: any;
    chain?: any;
    hardfork?: any;
    common?: any;
}


export const CHAIN_EIP1559_SET = new Set([
    ChainId.EthereumMainnet,
    ChainId.Rinkeby,
    ChainId.Izumi,
]);

export const buildSendingParams = (
    chain: BaseChain,
    params: TransactionObject,
    gasPrice: string | number
): TransactionObject => {
    if (CHAIN_EIP1559_SET.has(chain.id)) {
        return params;
    }
    const newParams = { ...params } as TransactionObject;
    if (newParams.maxFeePerGas !== undefined) {
        newParams.gasPrice = newParams.maxFeePerGas;
        delete newParams.maxFeePerGas;
    } else {
        newParams.gasPrice = gasPrice;
    }
    // todo: support transform from maxPriorityFeePerGas to maxFeePerGas
    if (newParams.maxPriorityFeePerGas !== undefined) {
        delete newParams.maxPriorityFeePerGas;
    }
    return newParams;
}