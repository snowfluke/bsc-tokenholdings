const WAValidator = require("multicoin-address-validator");
const axios = require("axios").default;
const cheerio = require("cheerio");
let tempusd;
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
  const { price_usd } = await getPrice(type);
  if (!price_usd)
    return { status: false, error_msg: `Failed to fetch ${type} price` };

  const { data } = await axios.post(
    "https://apius.reqbin.com/api/v1/requests",
    {
      id: "0",
      name: "",
      errors: "",
      json: `{"method":"GET","url":"${types[type].site}/tokenholdingsHandler.aspx?&a=${address}&q=&p=1&f=0&h=0&sort=total_price_usd&order=desc&pUsd=${price_usd}&fav=&langMsg=A%20total%20of%20XX%20tokenSS%20found","apiNode":"US","contentType":"","content":"","headers":"","errors":"","curlCmd":"","codeCmd":"","lang":"","auth":{"auth":"noAuth","bearerToken":"","basicUsername":"","basicPassword":"","customHeader":"","encrypted":""},"compare":false,"idnUrl":"${types[type].site}/tokenholdingsHandler.aspx?&a=${address}&q=&p=1&f=0&h=0&sort=total_price_usd&order=desc&pUsd=${price_usd}&fav=&langMsg=A%20total%20of%20XX%20tokenSS%20found"}`,
      deviceId: "",
      sessionId: "",
    }
  );

  const content = JSON.parse(await data.Content);

  tempusd = content.totalusd;
  return cheerio.load(content.layout, null, false);
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
    if ($.status === false) return { status: false, error_msg: $.error_msg };

    let tr = $("tr");
    let len = tr.length;

    let wallet = {
      totalValue: tempusd.replace("$", ""),
      currency: type,
      status: true,
      address,
    };

    for (let i = 0; i < len; i++) {
      let tokenName =
        $(tr[i].children["2"])["0"].children[0]?.attribs?.title ||
        $(tr[i].children["2"]).text();
      let balance = $(tr[i].children["3"]).text();
      let balanceInUsd = $(tr[i].children["7"]).text().replace("$", "");
      wallet[tokenName] = { balance, balance_in_usd: balanceInUsd };
    }

    tempusd = "";
    return wallet;
  } catch (error) {
    console.log(error);
    return { status: false, error_msg: error.message };
  }
};

module.exports = scan;
