
import {BaseChain, ChainId, initialChainTable, PriceRoundingType, TokenInfoFormatted} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { getPointDelta, getPoolContract, getPoolState } from '../../src/pool/funcs';
import { amount2Decimal, fetchToken } from '../../src/base/token/token';
import { pointDeltaRoundingDown, pointDeltaRoundingUp, priceDecimal2Point } from '../../src/base/price';
import { BigNumber } from 'bignumber.js'
import { calciZiLiquidityAmountDesired, getLiquidityManagerContract, getPoolAddress } from '../../src/liquidityManager';
import { getBoxContract, getAddLiquidityCall, AddLiquidityParams } from '../../src/box';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://data-seed-prebsc-2-s3.binance.org:8545/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))

    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const boxAddress = '0x904C130a8bf933f5c11Ea58CAA306f2296db22af'
    const boxContract = getBoxContract(boxAddress, web3)

    const feeB = {
        chainId: chain.id,
        name: '',
        symbol: 'FeeB',
        icon: '',
        address: '0x0C2CE63c797190dAE219A92AeBE4719Dc83AADdf',
        wrapTokenAddress: '0x5a2FEa91d21a8D53180020F8272594bf0D6F36DC',
        decimal: 18,
    } as TokenInfoFormatted
    
    const wBNB = {
        chainId: chain.id,
        name: '',
        symbol: 'BNB',
        icon: '',
        address: '0xa9754f0D9055d14EB0D2d196E4C51d8B2Ee6f4d3',
        wrapTokenAddress: undefined,
        decimal: 18,
    } as TokenInfoFormatted

    const fee = 2000 // 2000 means 0.2%


    const liquidityManagerAddress = '0x6bEae78975e561fDF27AaC6f09F714E69191DcfD'
    const liquidityManagerContract = getLiquidityManagerContract(liquidityManagerAddress, web3)

    console.log('aa')
    const poolAddress = await getPoolAddress(liquidityManagerContract, feeB, wBNB, fee)
    console.log('pool: ', poolAddress)
    const pool = getPoolContract(poolAddress, web3)

    const state = await getPoolState(pool)
    console.log('state: ', state)


    const leftPoint = 4680
    const rightPoint = 8760

    const maxFeeB = new BigNumber(1).times(10 ** feeB.decimal)
    const maxWBNB = calciZiLiquidityAmountDesired(
        leftPoint, rightPoint, state.currentPoint,
        maxFeeB, true, feeB, wBNB
    )
    console.log('max feeB: ', maxFeeB.toFixed(0))
    console.log('max wbnb: ', maxWBNB.toFixed(0))

    const maxWBNBDecimal = amount2Decimal(maxFeeB, feeB)

    console.log('maxWBNBDecimal: ', maxWBNBDecimal)


    const addLiquidityParams = {
        tokenId: '121',
        tokenA: wBNB,
        tokenB: feeB,
        fee,
        leftPoint,
        rightPoint,
        maxAmountA: maxWBNB.toFixed(0),
        maxAmountB: maxFeeB.toFixed(0),
        minAmountA: maxWBNB.times(0.8).toFixed(0),
        minAmountB: maxFeeB.times(0.8).toFixed(0),
    } as AddLiquidityParams

    const gasPrice = '15000000000'

    const { addLiquidityCalling, options } = getAddLiquidityCall(
        boxContract,
        account.address,
        chain,
        addLiquidityParams,
        gasPrice
    )
    
    const gasLimit = await addLiquidityCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await addLiquidityCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: boxAddress,
            data: addLiquidityCalling.encodeABI(),
            gas: new BigNumber(gasLimit * 1.1).toFixed(0, 2),
        }, 
        privateKey
    )
    // nonce += 1;
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('tx: ', tx);

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})
