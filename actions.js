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

  promptCli(question) {
    let answer = "";

    while (answer.length === 0) answer = prompt(question);

    return answer.includes(",") ? answer.split(",") : answer;
  }

  askUserForParameters(constants = new Constants()) {
    const questions = [
      constants.countPeoples,
      constants.firstDate,
      constants.lastDate,
      constants.firstCity,
      constants.lastCity,
    ];

    const answers = questions.map((question) => this.promptCli(question));

    const [adults = 0, childrens = 0, babies = 0] = answers[0];
    const [firstDate, lastDate, firstCity, lastCity] = answers.slice(1);

    return [
      adults,
      childrens,
      babies,
      firstDate,
      lastDate,
      firstCity,
      lastCity,
    ];
  }
}

module.exports = { CLIActions, WebActions };
