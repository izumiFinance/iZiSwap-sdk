
import {BaseChain, ChainId, initialChainTable } from '../../base/types'
import {privateKey} from '../../../.secret'
import Web3 from 'web3';
import { getLiquidityManagerContract, fetchLiquiditiesOfAccount } from '../../liquidityManager/view';
import { amount2Decimal, fetchToken } from '../../base/token/token';
import { BigNumber } from 'bignumber.js'
import { getAddLiquidityCall, getDecLiquidityCall } from '../../liquidityManager/liquidity';
import { calciZiLiquidityAmountDesired, getWithdrawLiquidityValue } from '../../liquidityManager/calc';
import { AddLiquidityParam, DecLiquidityParam } from '../../liquidityManager/types';

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://bsc-dataseed2.defibit.io/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    console.log('aaaaaaaa')
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const liquidityManagerAddress = '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581'
    const liquidityManagerContract = getLiquidityManagerContract(liquidityManagerAddress, web3)

    console.log('liquidity manager address: ', liquidityManagerAddress)

    const testAAddress = '0xCFD8A067e1fa03474e79Be646c5f6b6A27847399'
    const testBAddress = '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'

    const testA = await fetchToken(testAAddress, chain, web3)
    const testB = await fetchToken(testBAddress, chain, web3)
    const fee = 2000 // 2000 means 0.2%

    const liquidities = await fetchLiquiditiesOfAccount(
        chain, 
        web3, 
        liquidityManagerContract,
        '0xD0B1c02E8A6CA05c7737A3F4a0EEDe075fa4920C',
        [testA]
    )
    console.log('liquidity len: ', liquidities.length)
    console.log('liquidtys: ', liquidities)

    const liquidity1 = liquidities[1]

    const maxTestA = new BigNumber(100).times(10 ** testA.decimal)
    const maxTestB = calciZiLiquidityAmountDesired(
        liquidity1.leftPoint, liquidity1.rightPoint, liquidity1.state.currentPoint,
        maxTestA, true, testA, testB
    )
    console.log('max testA: ', maxTestA.toFixed(0))
    console.log('max testB: ', maxTestB.toFixed(0))

    const maxTestBDecimal = amount2Decimal(maxTestB, testB)

    console.log('maxTestBDecimal: ', maxTestBDecimal)


    const gasPrice = '5000000000'

    const {addLiquidityCalling, options} = getAddLiquidityCall(
        liquidityManagerContract,
        account.address,
        chain,
        {
            tokenId: liquidity1.tokenId,
            tokenA: testA,
            tokenB: testB,
            maxAmountA: maxTestA.toFixed(0),
            maxAmountB: maxTestB.toFixed(0),
            minAmountA: maxTestA.times(0.985).toFixed(0),
            minAmountB: maxTestB.times(0.985).toFixed(0),
        } as AddLiquidityParam,
        gasPrice
    )


    // before estimate gas and send transaction, 
    // make sure you have approve liquidityManagerAddress of token testA and testB
    const gasLimit = await addLiquidityCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await decLiquidityCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: liquidityManagerAddress,
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