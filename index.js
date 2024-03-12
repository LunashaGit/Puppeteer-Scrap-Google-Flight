const puppeteer = require("puppeteer");
const { Actions } = require("./actions.js");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const actions = new Actions(browser, page);
  await actions.openUrl();
})();
