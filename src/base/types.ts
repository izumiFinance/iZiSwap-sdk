
import { Contract } from 'web3-eth-contract'


export interface Dictionary<T> {
    [index: string]: T;
}

export interface TokenInfoFormatted {
    chainId: number;
    name?: string;
    symbol: string;
    icon?: string;
    address: string;
    wrapTokenAddress?: string;
    decimal: number;
    addTime?: Date;
    custom?: boolean;
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
    Matic = 137,
    Arbitrum = 42161,
    Cronos = 25,
    Icplaza = 142857,
    ConfluxESpace = 1030,
    Meter = 82,
    Telos = 40,
    Ontology = 58,
    Ultron = 1231,
    Mantle = 5000,
    Base = 8453,
    Linea = 59144,
    Loot = 5151706,
    OpBNB = 204,
    Kroma = 255,
    Manta = 169,
    Scroll = 534352,
    ZKFair = 42766,
    Zeta = 7000,
    Merlin = 4200,

    // testnet
    Rinkeby = 4,
    Goerli = 5,
    BSCTestnet = 97,
    OntologyTestnet = 5851,
    MaticTestnet = 80001,
    AuroraTestnet = 1313161555,
    ZkSyncAlphaTest = 280,
    MantleTest = 5001,
    ScrollTestL2 = 534351,
    LineaTest = 59140,
    OpsideTestRollux = 12008,
    MantaTest = 3441005,
    StagingFastActiveBellatrix = 1351057110,
    KromaSepoliaTest = 2358,
    GasZeroGoerliL2 = 12021,
    ZetaTest = 7001,
    ZKFairTest = 43851,
    X1Test = 195,
    MumbaiTest = 80001,
    TaikoKatlaL2Test = 167008,
    MorphTest = 2710,
    BeraTest = 80085,
    MerlinTest = 686868,
}


export interface BaseChain {
    id: number;
    name: string;
    tokenSymbol: string;
    token: Partial<TokenInfoFormatted>;
    wrappedTokenSymbol: string;
    wrappedToken: Partial<TokenInfoFormatted>;
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WBNB',
        wrappedToken: {
            symbol: 'WBNB',
            address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WMATIC',
        wrappedToken: {
            symbol: 'WMATIC',
            address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WCRO',
        wrappedToken: {
            symbol: 'WCRO',
            address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
            decimal: 18,
        },
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
            address: '0x4200000000000000000000000000000000000006',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x4200000000000000000000000000000000000006',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETC',
        wrappedToken: {
            symbol: 'WETC',
            address: '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a',
            decimal: 18,
        },
        scanUrl: 'https://blockscout.com/etc/mainnet/',
        scanName: 'EthereumClassicScan',
        vmType: 'EVM',
        rpcUrl: 'https://www.ethercluster.com/etc',
        blockDelta: 12.5,
        blockDeltaU: 14,
    },
    {
        id: ChainId.BSCTestnet,
        name: 'BSC Testnet',
        tokenSymbol: 'BNB',
        token: {
            symbol: 'BNB',
            address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WBNB',
        wrappedToken: {
            symbol: 'WBNB',
            address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
            decimal: 18,
        },
        scanUrl: 'https://testnet.aurorascan.dev/',
        scanName: 'TestnetAuroraScan',
        vmType: 'EVM',
        rpcUrl: 'https://testnet.aurora.dev',
        blockDelta: 1.5,
        blockDeltaU: 1.5,
    },
    {
        id: ChainId.Rinkeby,
        name: 'Rinkeby',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x8C3e3f2983DB650727F3e05B7a7773e4D641537B',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WONG',
        wrappedToken: {
            symbol: 'WONG',
            address: '0xe8cf015f797877a9a23e80447429c0b0f04e114b',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WONG',
        wrappedToken: {
            symbol: 'WONG',
            address: '0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b',
            decimal: 18,
        },
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
        tokenSymbol: 'MNT',
        token: {
            symbol: 'MNT',
            address: '0x6e1723460D190B4A092a2c13BA42BcC57d71870b',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WMNT',
        wrappedToken: {
            symbol: 'WMNT',
            address: '0x6e1723460D190B4A092a2c13BA42BcC57d71870b',
            decimal: 18,
        },
        scanUrl: 'https://explorer.testnet.mantle.xyz',
        scanName: 'mantle test scan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.testnet.mantle.xyz',
        blockDelta: 1,
        blockDeltaU: 1,
    },
    {
        id: ChainId.Mantle,
        name: 'Mantle',
        tokenSymbol: 'MNT',
        token: {
            symbol: 'MNT',
            address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WMNT',
        wrappedToken: {
            symbol: 'WMNT',
            address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
            decimal: 18,
        },
        scanUrl: 'https://explorer.mantle.xyz/',
        scanName: 'mantle test scan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.mantle.xyz',
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xa1EA0B2354F5A344110af2b6AD68e75545009a03',
            decimal: 18,
        },
        scanUrl: 'https://sepolia-blockscout.scroll.io/',
        scanName: 'scroll sepolia test scan',
        vmType: 'EVM',
        rpcUrl: 'https://sepolia-rpc.scroll.io/',
        blockDelta: 12,
        blockDeltaU: 12,
    },
    {
        id: ChainId.Scroll,
        name: 'Scroll Mainnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x5300000000000000000000000000000000000004',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x5300000000000000000000000000000000000004',
            decimal: 18,
        },
        scanUrl: 'https://blockscout.scroll.io',
        scanName: 'scroll scan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.scroll.io',
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WICT',
        wrappedToken: {
            symbol: 'WICT',
            address: '0xc59d478873d11CCc68F9c63571E821a253c5B605',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WCFX',
        wrappedToken: {
            symbol: 'WCFX',
            address: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WMTR',
        wrappedToken: {
            symbol: 'WMTR',
            address: '0x160361ce13ec33C993b5cCA8f62B6864943eb083',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WTLOS',
        wrappedToken: {
            symbol: 'WTLOS',
            address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
            decimal: 18,
        },
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
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
            decimal: 18,
        },
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
            address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WMatic',
        wrappedToken: {
            symbol: 'WMatic',
            address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
            decimal: 18,
        },
        scanUrl: 'https://mumbai.polygonscan.com/',
        scanName: 'PolygonMumbaiScan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    },
    {
        id: ChainId.Ultron,
        name: 'Ultron',
        tokenSymbol: 'ULX',
        token: {
            symbol: 'ULX',
            address: '0xb1183357745D3fD7d291E42a2c4B478cdB5710c6',
            decimal: 18,
        },
        wrappedTokenSymbol: 'wULX',
        wrappedToken: {
            symbol: 'wULX',
            address: '0xb1183357745D3fD7d291E42a2c4B478cdB5710c6',
            decimal: 18,
        },
        scanUrl: 'https://ulxscan.com',
        scanName: 'UltronScan',
        vmType: 'EVM',
        rpcUrl: 'https://ultron-rpc.net',
    },
    {
        id: ChainId.OpsideTestRollux,
        name: 'Opside Public zkEVM Testnet',
        tokenSymbol: 'IDE',
        token: {
            symbol: 'IDE',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        wrappedTokenSymbol: 'WIDE',
        wrappedToken: {
            symbol: 'WIDE',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        scanUrl: 'https://public.zkevm.opside.info',
        scanName: 'Opside Rollux Testnet Explorer',
        vmType: 'zkEVM',
        rpcUrl: 'https://pre-alpha-zkrollup-rpc.opside.network/public',
    },
    {
        id: ChainId.Base,
        name: 'Base',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x4200000000000000000000000000000000000006',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x4200000000000000000000000000000000000006',
            decimal: 18,
        },
        scanUrl: 'https://basescan.org/',
        scanName: 'base scan',
        vmType: 'EVM',
        rpcUrl: 'https://developer-access-mainnet.base.org',
    },
    {
        id: ChainId.LineaTest,
        name: 'Linea Testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
            decimal: 18,
        },
        scanUrl: 'https://explorer.goerli.linea.build/',
        scanName: 'Linea Testnet Explorer',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.goerli.linea.build/',
    },
    {
        id: ChainId.Linea,
        name: 'Linea',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
            decimal: 18,
        },
        scanUrl: 'https://lineascan.build/',
        scanName: 'Linea Explorer',
        vmType: 'EVM',
        rpcUrl: 'https://mainnet.infura.io/v3/',
    },
    {
        id: ChainId.Loot,
        name: 'Lootchain',
        tokenSymbol: 'AGLD',
        token: {
            symbol: 'AGLD',
            address: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WAGLD',
        wrappedToken: {
            symbol: 'WAGLD',
            address: '0x7a524c7e82874226F0b51aade60A1BE4D430Cf0F',
            decimal: 18,
        },
        scanUrl: 'https://explorer.lootchain.com/',
        scanName: 'Loot Mainnet Explorer',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.lootchain.com/http',
    },

    {
        id: ChainId.StagingFastActiveBellatrix,
        name: 'Skale Testnet',
        tokenSymbol: 'sFUEL',
        token: {
            symbol: 'sFUEL',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
            decimal: 18,
        },
        wrappedTokenSymbol: 'wsFUEL',
        wrappedToken: {
            symbol: 'wsFUEL',
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
            decimal: 18,
        },
        scanUrl: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com/',
        scanName: 'staging-fast-active-bellatrix scan',
        vmType: 'EVM',
        rpcUrl: 'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix/',
    },
    {
        id: ChainId.KromaSepoliaTest,
        name: 'Kroma Sepolia Testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x4200000000000000000000000000000000000001',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x4200000000000000000000000000000000000001',
            decimal: 18,
        },
        scanUrl: 'https://blockscout.sepolia.kroma.network/',
        scanName: 'Kroma Sepolia Testnet Blockscout',
        vmType: 'EVM',
        rpcUrl: 'https://api.sepolia.kroma.network/',
    },
    {
        id: ChainId.Kroma,
        name: 'Kroma',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x4200000000000000000000000000000000000001',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x4200000000000000000000000000000000000001',
            decimal: 18,
        },
        scanUrl: 'https://blockscout.kroma.network/',
        scanName: 'Kroma Mainnet Blockscout',
        vmType: 'EVM',
        rpcUrl: 'https://api.kroma.network/',
    },
    {
        id: ChainId.Manta,
        name: 'Manta Pacific',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
            decimal: 18,
        },
        scanUrl: 'https://manta-pacific.calderaexplorer.xyz/',
        scanName: 'manta scan',
        vmType: 'EVM',
        rpcUrl: 'https://manta-pacific.calderachain.xyz/http',
    },
    {
        id: ChainId.OpBNB,
        name: 'OpBNB',
        tokenSymbol: 'BNB',
        token: {
            symbol: 'BNB',
            address: '0x4200000000000000000000000000000000000006',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WBNB',
        wrappedToken: {
            symbol: 'WBNB',
            address: '0x4200000000000000000000000000000000000006',
            decimal: 18,
        },
        scanUrl: 'https://mainnet.opbnbscan.com/',
        scanName: 'OpBNB Mainnet scan',
        vmType: 'EVM',
        rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org/',
    },
    {
        id: ChainId.GasZeroGoerliL2,
        name: 'GasZeroGoerliL2',
        tokenSymbol: 'GAS0',
        token: {
            symbol: 'GAS0',
            address: '0xC6C7c2edF70A3245ad6051E93809162B9758ce08',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WGAS0',
        wrappedToken: {
            symbol: 'GAS0',
            address: '0xC6C7c2edF70A3245ad6051E93809162B9758ce08',
            decimal: 18,
        },
        scanUrl: 'https://scangoerlitest.gaszero.com/',
        scanName: 'GasZero GoerliL2 scan',
        vmType: 'EVM',
        rpcUrl: 'https://goerlitest.gaszero.com/',
    },
    {
        id: ChainId.ZetaTest,
        name: 'Zeta Testnet',
        tokenSymbol: 'aZETA',
        token: {
            symbol: 'aZETA',
            address: '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf',
            decimal: 18,
        },
        wrappedTokenSymbol: 'WZETA',
        wrappedToken: {
            symbol: 'WZETA',
            address: '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf',
            decimal: 18,
        },
        scanUrl: 'https://zetachain-athens-3.blockscout.com/',
        scanName: 'zeta testnet scan',
        vmType: 'EVM',
        rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public/',
    },

    {
        id: ChainId.Zeta,
        name: 'Zeta Mainnet',
        tokenSymbol: 'ZETA',
        token: {
            symbol: 'ZETA',
            decimal: 18,
            address: '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf',
        },
        wrappedTokenSymbol: 'WZETA',
        wrappedToken: {
            symbol: 'WZETA',
            decimal: 18,
            address: '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf',
        },
        scanUrl: 'https://zetachain.blockscout.com/',
        scanName: 'zeta blockscout',
        vmType: 'EVM',
        rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public/',
    },
    {
        id: ChainId.X1Test,
        name: 'X1 Testnet',
        tokenSymbol: 'OKB',
        token: {
            symbol: 'OKB',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        wrappedTokenSymbol: 'WOKB',
        wrappedToken: {
            symbol: 'WOKB',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        scanUrl: 'https://www.oklink.com/x1-test/',
        scanName: 'x1 testnet',
        vmType: 'EVM',
        rpcUrl: 'https://testrpc.x1.tech/',
    },
    {
        id: ChainId.ZKFairTest,
        name: 'zkfair Testnet',
        tokenSymbol: 'USDC',
        token: {
            symbol: 'USDC',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        wrappedTokenSymbol: 'WUSDC',
        wrappedToken: {
            symbol: 'WUSDC',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        scanUrl: 'https://testnet-scan.zkfair.io',
        scanName: 'zkfair testnet',
        vmType: 'EVM',
        rpcUrl: 'https://testnet-rpc.zkfair.io/',
    },
    {
        id: ChainId.ZKFair,
        name: 'ZKFair',
        tokenSymbol: 'USDC',
        token: {
            symbol: 'USDC',
            decimal: 18,
            address: '0xD33Db7EC50A98164cC865dfaa64666906d79319C',
        },
        wrappedTokenSymbol: 'WUSDC',
        wrappedToken: {
            symbol: 'WUSDC',
            decimal: 18,
            address: '0xD33Db7EC50A98164cC865dfaa64666906d79319C',
        },
        scanUrl: 'https://scan.zkfair.io',
        scanName: 'ZKFair mainnet explorer',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.zkfair.io',
    },

    {
        id: ChainId.MumbaiTest,
        name: 'MumbaiTest',
        tokenSymbol: 'MATIC',
        token: {
            symbol: 'MATIC',
            decimal: 18,
            address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
        },
        wrappedTokenSymbol: 'WMATIC',
        wrappedToken: {
            symbol: 'WMATIC',
            decimal: 18,
            address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
        },
        scanUrl: 'https://mumbai.polygonscan.com/',
        scanName: 'Mumbai testnet scan',
        vmType: 'EVM',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    },

    {
        id: ChainId.TaikoKatlaL2Test,
        name: 'Taiko Katla L2 testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            decimal: 18,
            address: '0xC6C7c2edF70A3245ad6051E93809162B9758ce08',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            decimal: 18,
            address: '0xC6C7c2edF70A3245ad6051E93809162B9758ce08',
        },
        scanUrl: 'https://explorer.katla.taiko.xyz/',
        scanName: 'taiko katla test l2 explore',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.katla.taiko.xyz',
    },
    {
        id: ChainId.MorphTest,
        name: 'Morph testnet',
        tokenSymbol: 'ETH',
        token: {
            symbol: 'ETH',
            decimal: 18,
            address: '0xC6C7c2edF70A3245ad6051E93809162B9758ce08',
        },
        wrappedTokenSymbol: 'WETH',
        wrappedToken: {
            symbol: 'WETH',
            decimal: 18,
            address: '0xC6C7c2edF70A3245ad6051E93809162B9758ce08',
        },
        scanUrl: 'https://explorer-testnet.morphl2.io/',
        scanName: 'morph testnet explore',
        vmType: 'EVM',
        rpcUrl: 'https://rpc-testnet.morphl2.io',
    },
    {
        id: ChainId.BeraTest,
        name: 'Bera testnet',
        tokenSymbol: 'BERA',
        token: {
            symbol: 'BERA',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        wrappedTokenSymbol: 'WBERA',
        wrappedToken: {
            symbol: 'WBERA',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        scanUrl: 'https://artio.beratrail.io/',
        scanName: 'bera testnet explore',
        vmType: 'EVM',
        rpcUrl: 'https://artio.rpc.berachain.com/',
    },
    {
        id: ChainId.Merlin,
        name: 'Merlin',
        tokenSymbol: 'BTC',
        token: {
            symbol: 'BTC',
            decimal: 18,
            address: '0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA',
        },
        wrappedTokenSymbol: 'WBTC',
        wrappedToken: {
            symbol: 'WBTC',
            decimal: 18,
            address: '0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA',
        },
        scanUrl: 'https://scan.merlinchain.io/',
        scanName: 'merlin explorer',
        vmType: 'EVM',
        rpcUrl: 'https://rpc.merlinchain.io/',
    },
    {
        id: ChainId.MerlinTest,
        name: 'Merlin Testnet',
        tokenSymbol: 'BTC',
        token: {
            symbol: 'BTC',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        wrappedTokenSymbol: 'WBTC',
        wrappedToken: {
            symbol: 'WBTC',
            decimal: 18,
            address: '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF',
        },
        scanUrl: 'https://testnet-scan.merlinchain.io/',
        scanName: 'merlin testnet explorer',
        vmType: 'EVM',
        rpcUrl: 'https://testnet-rpc.merlinchain.io',
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

export const getChain = (chainId: ChainId):BaseChain => {
    return initialChainTable[chainId]
}

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