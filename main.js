const puppeteer = require("puppeteer");
const notifier = require("node-notifier");

const token = process.argv.slice(2);
console.log(`Watching price for ${token}`);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.darkcrypto.finance/peg-market?sellToken=${token}`
  );
  await page.waitForSelector("div.box-price span");

  let sleepMs = 50;
  while (true) {
    const price = await page.$eval("div.box-price span", (el) => el.innerHTML);
    if (!isNaN(price)) {
      sleepMs = 3000;
      if (price > 1.0) {
        notifier.notify(`Price is ${price}`);
      } else {
        console.log(`Not yet.. ${price} < 1.0`);
      }
    } else {
      console.log("Waiting for price..");
    }

    await sleep(sleepMs);
  }

  await browser.close();
})();

const sleep = (time) =>
  new Promise((res) => setTimeout(res, time, "done sleeping"));
