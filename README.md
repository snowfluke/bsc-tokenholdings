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
  BNB: { balance_in_usd: '1.87 ', balance: '0.004477912626247038' },
  currency: 'bnb',
  status: true,
  address: '0x39Bce682DBFe79a0b940c8E833aaf2ab08098816',
  '1Gas.org': { balance: '92,280' },
  'AGMC.io': { balance: '800,000' },
  ANTEX: { balance: '160' },
  'ARKR.org': { balance: '800,000' },
  'AZSwap.io': { balance: '18,000' },
  BIG: { balance: '0.4' },
  BTL: { balance: '20' },
  BNBw: { balance: '21,131,181' },
  MELLO: { balance: '17,777' },
  CHILL: { balance: '5' },
  'Def8.io': { balance: '82,445' },
  DBT: { balance: '440' },
  'FF18.io': { balance: '800,000' },
  'KK8.io': { balance: '166,574' },
  'LinkP.io': { balance: '800,000' },
  MRS: { balance: '22.8' },
  'MMdex.io': { balance: '250,000' },
  MGRT: { balance: '1.1198' },
  'PDot.io': { balance: '95,641' },
  'PowNFT.net': { balance: '96,816.55' },
  ABOYS: { balance: '18,000,000' },
  ROCKETDOGE: { balance: '250,000,000' },
  'Zepe.io': { balance: '750,000' }
}
```
