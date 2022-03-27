const WAValidator = require("multicoin-address-validator");
const axios = require("axios").default;
const cheerio = require("cheerio");
const types = {
  bnb: {
    tickerId: "2710",
    site: "https://bscscan.com",
  },
  eth: {
    tickerId: "80",
    site: "https://etherscan.io",
  },
  matic: {
    tickerId: "33536",
    site: "https://polygonscan.com",
  },
};

const getPrice = async (type) => {
  const res = await axios.get(
    `https://api.coinlore.net/api/ticker/?id=${types[type].tickerId}`
  );

  const data = await res.data;
  return data[0];
};

const fetchToken = async (address, type) => {
  try {
    const { price_usd } = await getPrice(type);
    if (!price_usd)
      return { status: false, error_msg: `Failed to fetch ${type} price` };
    // https://bscscan.com/address/0x41bD5eB13b30ffd89AFf8e745f714F5A24F080E0
    const { data } = await axios.get(`${types[type].site}/address/${address}`);

    // const content = JSON.parse(await data.Content);

    // tempusd = content.totalusd;
    return cheerio.load(data, null, false);
  } catch (error) {
    return { status: false, error_msg: "Empty wallet" };
  }
};

/**
 *
 * @param {string} address your evm wallet address
 * @param {string} currency bnb, eth or matic
 */
const scan = async (address, currency) => {
  try {
    const validAddress = WAValidator.validate(address, "bnb");
    if (!validAddress)
      return { status: false, error_msg: "Invalid wallet address" };

    let type = currency.toLowerCase();
    if (!Object.keys(types).includes(type))
      return { status: false, error_msg: "Invalid type of currency" };

    const $ = await fetchToken(address, type);
    // if ($.status === false) return { status: false, error_msg: $.error_msg };

    let usdVal = $("div.col-md-8")["1"].children[0].data;
    let typeVal = $("div.col-md-8")["0"];
    let typeBalance = $(typeVal).text().split(" ");

    let tr = $("a.link-hover");
    let len = tr.length;

    let wallet = {
      [typeBalance[1]]: {
        balance_in_usd: usdVal.replace("$", ""),
        balance: typeBalance[0],
      },
      currency: type,
      status: true,
      address,
    };

    for (let i = 0; i < len; i++) {
      let token = $(tr[i].children[0].children[1]).text().split(" ");

      wallet[token[1]] = { balance: token[0] };
    }

    return wallet;
  } catch (error) {
    console.log(error.message);
    return { status: false, error_msg: "Empty wallet" };
  }
};

module.exports = scan;
