
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
