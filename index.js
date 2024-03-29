const puppeteer = require("puppeteer");
const { CLIActions, WebActions } = require("./actions.js");

(async () => {
  const cli = new CLIActions();
  const parameters = cli.askUserForParameters();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const web = new WebActions(browser, page);
  await web.openUrl();
  await web.completeForm(parameters);
})();
