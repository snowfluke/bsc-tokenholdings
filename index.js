const WAValidator = require("multicoin-address-validator");
const axios = require("axios").default;
const cheerio = require("cheerio");
let tempusd;

const getbnbprice = async (key) => {
  const res = await axios.get(
    `https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${key}`
  );

  const data = await res.data;
  return data;
};

const fetchToken = async (address, key) => {
  const d = await getbnbprice(key);
  if (d.status != "1") return { status: false, error_msg: "API Key Invalid" };

  const bnbprice = d.result.ethusd;
  const { data } = await axios.post(
    "https://apius.reqbin.com/api/v1/requests",
    {
      id: "0",
      name: "",
      errors: "",
      json: `{"method":"GET","url":"https://bscscan.com/tokenholdingsHandler.aspx?&a=${address}&q=&p=1&f=0&h=0&sort=total_price_usd&order=desc&pUsd=${bnbprice}&fav=&langMsg=A%20total%20of%20XX%20tokenSS%20found","apiNode":"US","contentType":"","content":"","headers":"","errors":"","curlCmd":"","codeCmd":"","lang":"","auth":{"auth":"noAuth","bearerToken":"","basicUsername":"","basicPassword":"","customHeader":"","encrypted":""},"compare":false,"idnUrl":"https://bscscan.com/tokenholdingsHandler.aspx?&a=${address}&q=&p=1&f=0&h=0&sort=total_price_usd&order=desc&pUsd=${bnbprice}&fav=&langMsg=A%20total%20of%20XX%20tokenSS%20found"}`,
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
 * @param {string} address your bep-20 wallet address
 * @param {string} apiKey your bscscan API Key
 */
const scan = async (address, apiKey) => {
  try {
    const validAddress = WAValidator.validate(address, "bnb");
    if (!validAddress)
      return { status: false, error_msg: "Wallet Address Invalid" };

    const $ = await fetchToken(address, apiKey);
    if ($.status === false) return { status: false, error_msg: $.error_msg };

    let tr = $("tr");
    let len = tr.length;

    let wallet = { totalValue: tempusd, status: true, address };

    for (let i = 0; i < len; i++) {
      let tokenName =
        $(tr[i].children["2"])["0"].children[0]?.attribs?.title ||
        $(tr[i].children["2"]).text();
      let balance = $(tr[i].children["3"]).text();
      let balanceInUsd = $(tr[i].children["7"]).text();
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
