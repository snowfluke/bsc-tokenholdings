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
const userAgent = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
];

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
    let agentId = Math.floor(Math.random() * userAgent.length);
    if (!price_usd)
      return { status: false, error_msg: `Failed to fetch ${type} price` };
    const res = await axios.get(`${types[type].site}/address/${address}`, {
      headers: {
        "User-Agent": userAgent[agentId],
      },
    });

    if (res.status === 403) throw new Error("Blocked by Cloudflare");
    const data = await res.data;

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
    if ($.status === false) return { status: false, error_msg: $.error_msg };

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
    return { status: false, error_msg: "Empty wallet" };
  }
};

module.exports = { scan };
