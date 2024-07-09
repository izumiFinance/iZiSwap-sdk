
import {BaseChain, ChainId, initialChainTable} from '../../src/base/types'
import {privateKey} from '../../.secret'
import Web3 from 'web3';
import { getCreatePoolCall, getFactoryContract, getPoolAddress } from '../../src/pool/funcs';
import { BigNumber } from 'bignumber.js'

async function main(): Promise<void> {
    const chain:BaseChain = initialChainTable[ChainId.BSCTestnet]
    const rpc = 'https://data-seed-prebsc-1-s3.binance.org:8545/'
    console.log('rpc: ', rpc)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const account =  web3.eth.accounts.privateKeyToAccount(privateKey)
    console.log('address: ', account.address)

    const factoryAddress = '0x7fc0574eAe768B109EF38BC32665e6421c52Ee9d'
    const factoryContract = getFactoryContract(factoryAddress, web3)

    const testAAddress = '0xCFD8A067e1fa03474e79Be646c5f6b6A27847399'
    const testBAddress = '0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'

    // feeRate = feeContractNumber / 1e6
    // etc, 3000 means 0.3%
    // you should choose a proper feeRate of new pool
    // which should be supported by factory on that chain
    const feeContractNumber = 400;
    // we can first check if some one has created the pool before
    const poolAddress = await getPoolAddress(factoryContract, testAAddress, testBAddress, feeContractNumber);
    if (!(new BigNumber(poolAddress).eq('0'))) {
        // if poolAddress is not zero address,
        //     this means some one has created the pool with same token pair and feeRate before.
        //     in this situation,  we can not create pool with same pair and feeRate in the following code.
        console.log('pool has been created! Address: ', poolAddress);
        return;
    }
    // you can choose a proper initial point, which
    // specify init price of tokenX (by tokenY)
    const initPointXByY = 100;
    const gasPrice = '5000000000';

    // get calling
    // before calling getCreatePoolCall(...)
    // we should garrentee that
    // tokenXAddress.toLowerCase() < tokenYAddress.toLowerCase()
    let tokenXAddress = testAAddress;
    let tokenYAddress = testBAddress;
    if (tokenXAddress.toLowerCase() > tokenYAddress.toLowerCase()) {
        tokenXAddress = testBAddress;
        tokenYAddress = testAAddress;
    }
    const {createPoolCalling, options} = getCreatePoolCall(
        factoryContract,
        tokenXAddress,
        tokenYAddress,
        feeContractNumber,
        initPointXByY,
        account.address,
        chain,
        gasPrice,
    )

    // esitmate gas
    // if error occurs when estimating gas,
    //     this means some one might create the pool before with
    //     same token pair and feeRate before
    //     you can call getPoolAddress(...) to get the pool address
    //     as mentioned above
    const gasLimit = await createPoolCalling.estimateGas(options)
    console.log('gas limit: ', gasLimit)

    // sign and sending transaction
    // for metamask or other explorer's wallet provider
    // one can easily use 
    //
    //    await collectLimitOrderCalling.send({...options, gas: gasLimit})
    //
    // instead of following 
    // 'web3.eth.accounts.signTransaction' 
    // and 'web3.eth.sendSignedTransaction'
    const signedTx = await web3.eth.accounts.signTransaction(
        {
            ...options,
            to: factoryAddress,
            data: createPoolCalling.encodeABI(),
            gas: new BigNumber(gasLimit * 1.1).toFixed(0, 2),
        }, 
        privateKey
    )
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('tx: ', tx);

}

main().then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})