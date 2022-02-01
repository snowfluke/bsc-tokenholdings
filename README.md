"# bsc-tokenholdings"

NPM package to scan token holdings in a Binance Smart Chain (BSC) Wallet Address. Normally you would upgrade your plan on BSCSCAN API, with this package you don't have to.

## Get the BSCScan API key

Go to https://docs.bscscan.com/getting-started/creating-an-account and get your API key there

## Usage

```js
const scan = require('bsc-tokenholdings)
const BSC_API_KEY = 'your bscscan api key'

async function test(){
    const result = await scan('0x39Bce682DBFe79a0b940c8E833aaf2ab08098816', BSC_API_KEY)
    console.log(result)

}

test()
```

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
    address: '0x...'
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
