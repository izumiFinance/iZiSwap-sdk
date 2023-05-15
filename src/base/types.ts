
import { Contract } from 'web3-eth-contract'


export interface Dictionary<T> {
    [index: string]: T;
}

export interface TokenInfoFormatted {
    chainId: number;
    name: string;
    symbol: string;
    icon: string;
    address: string;
    wrapTokenAddress?: string;
    decimal: number;
    addTime?: Date;
    custom: boolean;
}

export enum ChainId {
    None = -1,
    // mainnet
    EthereumMainnet = 1,
    Optimism = 10,
    ZkSyncEra = 324,
    BSC = 56,
    ETC = 61,
    Aurora = 1313161554,
    Gatechain = 86,
    Heco = 128,
    Matic = 137,
    Fantom = 250,
    Arbitrum = 42161,
    Harmony = 1666600000,
    Cronos = 25,
    Icplaza = 142857,
    ConfluxESpace = 1030,
    Meter = 82,
    Telos = 40,
    Ontology = 58,

    // testnet
    Rinkeby = 4,
    Goerli = 5,
    BSCTestnet = 97,
    OntologyTestnet = 5851,
    MaticTestnet = 80001,
    AuroraTestnet = 1313161555,
    HarmonyTestnet = 1666700000,
    ZkSyncAlphaTest = 280,
    MantleTest = 5001,
    ScrollTestL2 = 534353,
}


export interface BaseChain {
    id: number;
    name: string;
    tokenSymbol: string;
    token: Partial<TokenInfoFormatted>;
    wrappedTokenSymbol?: string;
    wrappedToken?: Partial<TokenInfoFormatted>;
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
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        },
        icon: '/assets/tokens/eth.png',
        scanUrl: 'https://etherscan.io/',
        scanName: 'EtherScan',
        vmType: 'EVM',
        rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.BSC,
        name: 'BNB-Chain',
        tokenSymbol: 'BNB',
        token: {
            symbol: 'BNB',
            address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        },
        wrappedTokenSymbol: 'WBNB',
        wrappedToken: {
            symbol: 'WBNB',
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
        id: ChainId.Aurora,
        name: 'Aurora Chain',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
        },
        icon: '/assets/tokens/aurora.png',
        scanUrl: 'https://aurorascan.dev/',
        scanName: 'AuroraScan',
        vmType: 'EVM',
        rpcUrl: 'https://mainnet.aurora.dev',
        blockDelta: 1.5,
        blockDeltaU: 1.5,
    },
    {
        id: ChainId.Arbitrum,
        name: 'Arbitrum',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        icon: '/assets/tokens/arbitrum.svg',
        scanUrl: 'https://arbiscan.io/',
        scanName: 'ArbiScan',
        vmType: 'EVM',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Matic,
        name: 'Polygon',
        tokenSymbol: 'Matic',
        token: {
            symbol: 'MATIC',
            address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        },
        wrappedTokenSymbol: 'WMATIC',
        wrappedToken: {
            symbol: 'WMATIC',
            address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        },
        icon: '/assets/tokens/matic.png',
        scanUrl: 'https://polygonscan.com/',
        scanName: 'PologonScan',
        vmType: 'EVM',
        rpcUrl: 'https://polygon-rpc.com/',
        blockDelta: 2,
        blockDeltaU: 2.2,
    },
    {
        id: ChainId.Cronos,
        name: 'Cronos',
        tokenSymbol: 'CRO',
        token: {
            symbol: 'CRO',
            address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        },
        wrappedTokenSymbol: 'WCRO',
        wrappedToken: {
            symbol: 'WCRO',
            address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        },
        icon: '/assets/tokens/cronos.png',
        scanUrl: 'https://cronoscan.com/',
        scanName: 'CronosScan',
        vmType: 'EVM',
        rpcUrl: 'https://node.croswap.com/rpc',
        blockDelta: 12,
        blockDeltaU: 12,
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
        id: ChainId.ETC,
        name: 'Ethereum Classic',
        tokenSymbol: 'ETC',
        token: {
            symbol: 'ETC',
            address: '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a',
        },
        wrappedTokenSymbol: 'WETC',
        wrappedToken: {
            symbol: 'WETC',
            address: '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a',
        },
        icon: '/assets/tokens/etc.png',
        scanUrl: 'https://blockscout.com/etc/mainnet/',
        scanName: 'EthereumClassicScan',
        vmType: 'EVM',
        rpcUrl: 'https://www.ethercluster.com/etc',
        blockDelta: 12.5,
        blockDeltaU: 14,
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
            address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
        },
        wrappedTokenSymbol: 'WBNB',
        wrappedToken: {
            symbol: 'WBNB',
            address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
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
        id: ChainId.AuroraTestnet,
        name: 'Aurora Testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        icon: '/assets/tokens/aurora.png',
        scanUrl: 'https://testnet.aurorascan.dev/',
        scanName: 'TestnetAuroraScan',
        vmType: 'EVM',
        rpcUrl: 'https://testnet.aurora.dev',
        blockDelta: 1.5,
        blockDeltaU: 1.5,
    },
    {
        id: ChainId.Heco,
        name: 'Heco',
        tokenSymbol: 'HT',
        token: {
            symbol: 'HT',
        },
        icon: '/assets/tokens/HECO.svg',
        scanUrl: 'https://hecoinfo.com/',
        scanName: 'HecoInfo',
        vmType: 'EVM',
        rpcUrl: 'https://http-mainnet-node.huobichain.com',
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
        id: ChainId.Rinkeby,
        name: 'Rinkeby',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        },
        icon: '/assets/tokens/eth.png',
        scanUrl: 'https://rinkeby.etherscan.io/',
        scanName: 'EtherScan',
        vmType: 'EVM',
        rpcUrl: 'https://rinkeby.infura.io/v3/',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.ZkSyncAlphaTest,
        name: 'ZkSync Testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x8C3e3f2983DB650727F3e05B7a7773e4D641537B',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x8C3e3f2983DB650727F3e05B7a7773e4D641537B',
        },
        icon: '/assets/tokens/zksync.png',
        scanUrl: 'https://zksync2-testnet.zkscan.io/',
        scanName: 'zkSync scan',
        vmType: 'ZKVM',
        rpcUrl: 'https://zksync2-testnet.zksync.dev',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.ZkSyncEra,
        name: 'zkSync Era',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
        },
        icon: '/assets/tokens/zksync.png',
        scanUrl: 'https://explorer.zksync.io/',
        scanName: 'zkSync scan',
        vmType: 'ZKVM',
        rpcUrl: 'https://zksync2-mainnet.zksync.io',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.OntologyTestnet,
        name: 'Ontology Testnet',
        tokenSymbol: 'ONG',
        token: {
            symbol: 'ONG',
            address: '0xe8cf015f797877a9a23e80447429c0b0f04e114b',
        },
        wrappedTokenSymbol: 'WONG',
        wrappedToken: {
            symbol: 'WONG',
            address: '0xe8cf015f797877a9a23e80447429c0b0f04e114b',
        },
        icon: '/assets/tokens/ont.png',
        scanUrl: 'https://explorer.ont.io/testnet',
        scanName: 'ontology test scan',
        vmType: 'EVM',
        rpcUrl: 'https://polaris1.ont.io:10339',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Ontology,
        name: 'Ontology',
        tokenSymbol: 'ONG',
        token: {
            symbol: 'ONG',
            address: '0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b',
        },
        wrappedTokenSymbol: 'WONG',
        wrappedToken: {
            symbol: 'WONG',
            address: '0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b',
        },
        icon: '/assets/tokens/ont.png',
        scanUrl: 'https://explorer.ont.io/',
        scanName: 'ontology test scan',
        vmType: 'EVM',
        rpcUrl: 'https://dappnode1.ont.io:10339',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.MantleTest,
        name: 'Mantle Testnet',
        tokenSymbol: 'BIT',
        token: {
            symbol: 'BIT',
            address: '0x69AC69b272f96F5f17DDD9da3832ad9Dc86D1d8A',
        },
        wrappedTokenSymbol: 'WBIT',
        wrappedToken: {
            symbol: 'WBIT',
            address: '0x69AC69b272f96F5f17DDD9da3832ad9Dc86D1d8A',
        },
        icon: '/assets/tokens/mantle.png',
        scanUrl: 'https://explorer.testnet.mantle.xyz',
        scanName: 'mantle test scan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.testnet.mantle.xyz',
        blockDelta: 1,
        blockDeltaU: 1,
    },
    {
        id: ChainId.ScrollTestL2,
        name: 'Scroll Testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xa1EA0B2354F5A344110af2b6AD68e75545009a03',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xa1EA0B2354F5A344110af2b6AD68e75545009a03',
        },
        icon: '/assets/tokens/scroll.png',
        scanUrl: 'https://blockscout.scroll.io/',
        scanName: 'scroll test scan',
        vmType: 'EVM',
        rpcUrl: 'https://alpha-rpc.scroll.io/l2',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Icplaza,
        name: 'Icplaza',
        tokenSymbol: 'ICT',
        token: {
            symbol: 'ICT',
            address: '0xc59d478873d11CCc68F9c63571E821a253c5B605',
        },
        wrappedTokenSymbol: 'WICT',
        wrappedToken: {
            symbol: 'WICT',
            address: '0xc59d478873d11CCc68F9c63571E821a253c5B605',
        },
        icon: '/assets/tokens/icplaza.png',
        scanUrl: 'https://browsemainnet.ic-plaza.org/index/',
        scanName: 'icplaza scan',
        vmType: 'EVM',
        rpcUrl: 'https://rpcmainnet.ic-plaza.org/',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.ConfluxESpace,
        name: 'Conflux',
        tokenSymbol: 'CFX',
        token: {
            symbol: 'CFX',
            address: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
        },
        wrappedTokenSymbol: 'WCFX',
        wrappedToken: {
            symbol: 'WCFX',
            address: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
        },
        icon: '/assets/tokens/cfx.png',
        scanUrl: 'https://evm.confluxscan.net',
        scanName: 'conflux espace scan',
        vmType: 'EVM',
        rpcUrl: 'https://evm.confluxrpc.com',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Meter,
        name: 'Meter',
        tokenSymbol: 'MTR',
        token: {
            symbol: 'MTR',
            address: '0x160361ce13ec33C993b5cCA8f62B6864943eb083',
        },
        wrappedTokenSymbol: 'WMTR',
        wrappedToken: {
            symbol: 'WMTR',
            address: '0x160361ce13ec33C993b5cCA8f62B6864943eb083',
        },
        icon: '/assets/tokens/mtr.png',
        scanUrl: 'https://scan.meter.io',
        scanName: 'meter scan',
        vmType: 'EVM',
        rpcUrl: 'https://pokt.network',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Telos,
        name: 'Telos',
        tokenSymbol: 'TLOS',
        token: {
            symbol: 'TLOS',
            address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
        },
        wrappedTokenSymbol: 'WTLOS',
        wrappedToken: {
            symbol: 'WTLOS',
            address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
        },
        icon: '/assets/tokens/tlos.png',
        scanUrl: 'https://www.teloscan.io/',
        scanName: 'telo scan',
        vmType: 'EVM',
        rpcUrl: 'https://mainnet.telos.net/evm',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Goerli,
        name: 'Goerli',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
        },
        icon: '/assets/tokens/eth.png',
        scanUrl: 'https://goerli.etherscan.io/',
        scanName: 'goerliScan',
        vmType: 'EVM',
        rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        blockDelta: 14,
        blockDeltaU: 14,
    },
    {
        id: ChainId.MaticTestnet,
        name: 'Polygon Mumbai Testnet',
        tokenSymbol: 'Matic',
        token: {
            symbol: 'Matic',
        },
        icon: '/assets/tokens/matic.png',
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