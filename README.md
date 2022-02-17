# bsc-tokenholdings

NPM package to scan token holdings in a Binance Smart Chain (BSC) Wallet Address. Normally you would upgrade your plan on BSCSCAN API, with this package you don't have to.

# Support EVM (Ethereum Virtual Machine)

Now you can scan bsc, eth and matic wallet all in one package.

# Instalation

`npm i bsc-tokenholdings`

Or

`yarn add bsc-tokenholdings`

## Usage

```js
const scan = require("bsc-tokenholdings");
const address = "0x39Bce682DBFe79a0b940c8E833aaf2ab08098816";

async function test() {
  const result = await scan(address, "bnb");
  console.log(result);
}

test();
```

## Parameter

1. EVM adddress (bep20, erc20, polygon)
2. Type of evm (bnb, eth, matic)

# Result Object

```js
// If Error
{
    status: false,
    error_msg: ''
}

// If Success
{
    status: true,
    currency: 'bnb',
    address: '0x...',
    totalValue: '203.37', // in usd
    BNB: {
        balance: '0.31392916',
        balance_in_usd: '140.29'
    },
    BUSD: {
        balance: '2',
        balance_in_usd: '2.00'
    },
    //...
}
```
