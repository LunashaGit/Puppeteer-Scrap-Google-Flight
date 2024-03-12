const { Constants } = require("./constants.js");

class Actions {
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

module.exports = { Actions };
