
# iZUMi-iZiSwap-sdk

The latest version of the SDK is considered Alpha software and may contain bugs or change significantly between patch versions.

Check [iZUMi.finance](https://developer.izumi.finance/iZiSwap/SDK/) for in-depth documentation.

## run example

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