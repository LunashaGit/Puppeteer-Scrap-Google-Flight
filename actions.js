const { Constants } = require("./constants.js");
const prompt = require("prompt-sync")();

class WebActions {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  async sleep(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async openUrl(url = null, constants = new Constants()) {
    url = url ?? constants.defaultUrl;
    await this.page.goto(url);
    await this.checkGoogleElement();
  }

  async searchElementByText(html, text) {
    try {
      return await this.page.waitForSelector(
        `xpath///${html}[contains(text(), "${text}")]`,
        { timeout: 5000 }
      );
    } catch (e) {
      return null;
    }
  }

  async checkGoogleElement(constants = new Constants()) {
    const exist = await this.searchElementByText(
      "h1",
      constants.cookiesGoogleSearchPage
    );

    if (exist == null) return;

    const refuse = await this.searchElementByText(
      "span",
      constants.refuseCookies
    );
    if (refuse != null) refuse.click();
  }
}

class CLIActions {
  constructor() {}

  promptCli(question, value) {
    let answer = "";
    while (answer.length === 0) {
      answer = prompt(question);
    }
    if (answer.includes(",")) value = answer.split(",");
    if (!answer.includes(",")) value = answer;
    return value;
  }

  async askUserForParameters(constants = new Constants()) {
    let adults, childrens, babies, travel;

    [adults, childrens, babies] = this.promptCli(constants.countPeoples, [
      adults,
      childrens,
      babies,
    ]);

    travel = this.promptCli(constants.roundTrip, travel);

    [adults, childrens, babies] = [adults, childrens, babies].map((value) => {
      return value === undefined ? 0 : value;
    });

    console.log(adults, childrens, babies, travel);
    return [adults, childrens, babies, travel];
  }
}

module.exports = { CLIActions, WebActions };
