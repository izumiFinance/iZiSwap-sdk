
import { Contract } from 'web3-eth-contract'

export declare interface Dictionary<T> {
    [index: string]: T;
}

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

const initialChains: BaseChain[] = [
    {
        id: ChainId.EthereumMainnet,
        name: 'Ethereum',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        },
        icon: '/assets/tokens/eth.png',
        scanUrl: 'https://etherscan.io/',
        scanName: 'EtherScan',
        vmType: 'EVM',
        rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        blockDelta: 12.5,
        blockDeltaU: 14,
    },
    {
        id: ChainId.Optimism,
        name: 'Optimism',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
        },
        icon: '/assets/tokens/OP.svg',
        scanUrl: 'https://optimistic.etherscan.io/',
        scanName: 'OptimismScan',
        vmType: 'EVM',
        rpcUrl: 'https://mainnet.optimism.io',
    },
    {
        id: ChainId.BSC,
        name: 'BSC',
        tokenSymbol: 'BNB',
        token: {
            symbol: 'BNB',
            address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        },
        icon: '/assets/tokens/bnbChain.png',
        scanUrl: 'https://bscscan.com/',
        scanName: 'BscScan',
        vmType: 'EVM',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockDelta: 3,
        blockDeltaU: 3,
    },
    {
        id: ChainId.Gatechain,
        name: 'Gatechain',
        tokenSymbol: 'GT',
        token: {
            symbol: 'GT',
        },
        icon: '/assets/tokens/GT.png',
        scanUrl: 'https://gatescan.org/',
        scanName: 'GateScan',
        vmType: 'EVM',
        rpcUrl: 'https://evm.gatenode.cc',
    },
    {
        id: ChainId.BSCTestnet,
        name: 'BSC Testnet',
        tokenSymbol: 'BNB',
        token: {
            symbol: 'BNB',
            address: '0xa9754f0D9055d14EB0D2d196E4C51d8B2Ee6f4d3',
        },
        icon: '/assets/tokens/bsc.png',
        scanUrl: 'https://testnet.bscscan.com/',
        scanName: 'TestnetBscScan',
        vmType: 'EVM',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        blockDelta: 3,
        blockDeltaU: 3,
    },
    {
        id: ChainId.Heco,
        name: 'Heco',
        tokenSymbol: 'HT',
        token: {
            symbol: 'HT',
        },
        icon: '/assets/tokens/heco.png',
        scanUrl: 'https://hecoinfo.com/',
        scanName: 'HecoInfo',
        vmType: 'EVM',
        rpcUrl: 'https://http-mainnet-node.huobichain.com',
    },
    {
        id: ChainId.Matic,
        name: 'Polygon',
        tokenSymbol: 'Matic',
        token: {
            symbol: 'MATIC',
        },
        icon: '/assets/tokens/polygon.png',
        scanUrl: 'https://polygonscan.com/',
        scanName: 'PologonScan',
        vmType: 'EVM',
        rpcUrl: 'https://polygon-rpc.com/',
        blockDelta: 2,
        blockDeltaU: 2.2,
    },
    {
        id: ChainId.Fantom,
        name: 'Fantom',
        tokenSymbol: 'FTM',
        token: {
            symbol: 'FTM',
        },
        icon: '/assets/tokens/fantom.png',
        scanUrl: 'https://ftmscan.com/',
        scanName: 'FtmScan',
        vmType: 'EVM',
        rpcUrl: 'https://rpcapi.fantom.network',
    },
    {
        id: ChainId.Izumi,
        name: 'izumi',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x3AD23A16A81Cd40010F39309876978F20DD2f682',
        },
        icon: '/assets/tokens/izumi.svg',
        scanUrl: 'http://47.241.103.6:9000/',
        scanName: 'izumiScan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.izumi.finance/',
        blockDelta: 14,
        blockDeltaU: 14,
    }, // izumi private chain
    {
        id: ChainId.Rinkeby,
        name: 'Rinkeby',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
        },
        icon: '/assets/tokens/eth.png',
        scanUrl: 'https://rinkeby.etherscan.io/',
        scanName: 'rinkebyScan',
        vmType: 'EVM',
        rpcUrl: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        blockDelta: 14,
        blockDeltaU: 14,
    },
    {
        id: ChainId.Arbitrum,
        name: 'Arbitrum',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        icon: '/assets/tokens/arbitrum.svg',
        scanUrl: 'https://arbiscan.io/',
        scanName: 'ArbiScan',
        vmType: 'EVM',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockDelta: 12.5,
        blockDeltaU: 13.5,
    },
    {
        id: ChainId.MaticTestnet,
        name: 'Polygon Mumbai Testnet',
        tokenSymbol: 'Matic',
        token: {
            symbol: 'Matic',
        },
        icon: '/assets/tokens/polygon.png',
        scanUrl: 'https://mumbai.polygonscan.com/',
        scanName: 'PolygonMumbaiScan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    },
    {
        id: ChainId.Harmony,
        name: 'Harmony',
        tokenSymbol: 'ONE',
        token: {
            symbol: 'ONE',
        },
        icon: '/assets/tokens/harmony.png',
        scanUrl: 'https://explorer.harmony.one/#/',
        scanName: 'HarmonyScan',
        vmType: 'EVM',
        rpcUrl: 'https://api.harmony.one',
    },
    {
        id: ChainId.HarmonyTestnet,
        name: 'Harmony Shard0 Testnet',
        tokenSymbol: 'ONE',
        token: {
            symbol: 'ONE',
        },
        icon: '/assets/tokens/harmony.png',
        scanUrl: 'https://explorer.pops.one/#/',
        scanName: 'HarmonyTestScan',
        vmType: 'EVM',
        rpcUrl: 'https://api.s0.b.hmny.io',
    },
];

const lookupTableReducer = (
    table: Dictionary<BaseChain>,
    next: BaseChain,
    index: number
) => {
    table[next.id] = initialChains[index];
    return table;
};

export const initialChainTable = initialChains.reduce(lookupTableReducer, {})

export enum PointRoundingType {
    POINT_ROUNDING_NEAREST = 0,
    POINT_ROUNDING_UP = 1,
    POINT_ROUNDING_DOWN = 2
}

export enum PriceRoundingType {
    PRICE_ROUNDING_NEAREST = 0,
    PRICE_ROUNDING_UP = 1,
    PRICE_ROUNDING_DOWN = 2
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