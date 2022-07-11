const puppeteer = require("puppeteer");
const notifier = require("node-notifier");

const SLEEP_MS = 3000;
const TOKENS = ["DUSDC", "DUSDT", "DCRO", "DCOF"];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const pages = {};
  for (const token of TOKENS) {
    const page = await browser.newPage();
    await page.goto(
      `https://www.darkcrypto.finance/peg-market?sellToken=${token}`
    );
    await page.waitForSelector("div.box-price span");

    pages[token] = page;
  }

  while (true) {
    const prices = {};
    for (const token of Object.keys(pages)) {
      const page = pages[token];
      await page.bringToFront();
      await sleep(SLEEP_MS);

      let price = await page.$eval("div.box-price span", (el) => el.innerHTML);

      if (!isNaN(price)) {
        price = parseFloat(price);
        if (price > 1.0) {
          notifier.notify(`Price is for ${token} is above 1.0! ** ${price} **`);
        }
      } else {
        price = "N/A";
      }

      prices[token] = price;
    }
    console.clear();
    console.log(
      `Watching prices for ${TOKENS.join(", ")} -- ${new Date().toDateString()}`
    );
    console.table(prices);
  }

  await browser.close();
})();

const sleep = (time) =>
  new Promise((res) => setTimeout(res, time, "done sleeping"));
