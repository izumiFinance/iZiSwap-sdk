
# iZUMi-iZiSwap-sdk

The latest version of the SDK is considered Alpha software and may contain bugs or change significantly between patch versions.

Check [iZUMi.finance](https://developer.izumi.finance/iZiSwap/SDK/) for in-depth documentation.

Check [Github](https://github.com/izumiFinance/iZiSwap-sdk) for latest sdk code.

## run example

Notice that, this section we only talk about how to run the attached examples after cloning this `sdk-source-project` from github. For usage of this sdk, you should install this package from npm in your project (see next section for installation command).

Suppose you want to run example of mint, you could first compile that example.
```
$ npx tsc example/liquidityManager/mint.ts --resolveJsonModule --esModuleInterop --outDir bin
```
and then run the compiled js file.
```
$ node bin/example/liquidityManager/mint.js
```

## install

to install sdk in your project, use following command.
```
$ npm install iziswap-sdk
```

## new from version 1.2.0

the difference is that we add a new way to specify whether to use `wrapped gas token` (like `WBNB` on `BSC`, or `WETH` on `ethereum` or `arbitrum`...), or to use `gas token` (like `BNB` on `BSC` or `ETH` on `ethereum` or `arbitrum`)

in the past versions (before 1.2.0), when we call swap/mint/collect/newLimitOrder or other interfaces to pay or acquire tokens, we need to specify a field named `strictERC20Token` in the params to indicate the sdk whether to treat `wrapped gas token` as `erc20 token` or `gas token`.

And in the version from 1.2.0, we can also indicate that via setting appropriate `symbol` in the token object.

For example, assume we want to pay at most 1 `BNB` to get at least 300 `USDC` on bsc's iziswap.
We could fill the swap params as following:
```
    const BNB = {
        address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        symbol: 'BNB',
        chainId: ChainId.BSC
    } as TokenInfoFormatted
    const USDC = {
        address: '0xc1f47175d96fe7c4cd5370552e5954f384e3c791',
        symbol: 'USDC',
        chainId: ChainId.BSC
    } as TokenInfoFormatted
    const swapParams = {
        tokenChain: [BNB, USDC],
        feeChain: [200],
        inputAmount: new BigNumber(10 ** 18).toFixed(0)
        minOutputAmount: new BigNumber(300 * 10 ** 6).toFixed(0)
    } as SwapChainWithExactInputParams
```

in the old versions, if we want to pay `BNB` in the form of `WBNB`, we should set `swapParams.strictERC20Token` as `true`, and if we want to pay `BNB` directly, we should set `swapParams.strictERC20Token` as `false` or `undefined`.

from the version 1.2.0, if we want to pay `BNB` in the form of `WBNB`, we should set `swapParams.strictERC20Token` as `true`, and if we want to pay `BNB` directly, we should set `swapParams.strictERC20Token` as `false` but **not** `undefined`.

That is because, if we set that value as `undefined`, the sdk will check token's `symbol` field to indicate whether to use `gas token` or not.

if we set `swapParams.strictERC20Token` as `undefined`, we should replace `BNB.symbol` as `WBNB` in the above code if we want to pay from our `WBNB` balance.