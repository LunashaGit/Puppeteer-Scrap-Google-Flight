const { Constants } = require("./constants.js");
const prompt = require("prompt-sync")();
const fs = require("fs");

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

  async searchElementByClass(html, text) {
    try {
      return await this.page.$x(`//${html}[@class='${text}')]`, {
        timeout: 5000,
      });
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

  async tab(back = false) {
    if (back) {
      await this.page.keyboard.down("Shift");
      await this.pressInput("Tab");
      return await this.page.keyboard.up("Shift");
    }

    return await this.page.keyboard.press("Tab");
  }
  async pressInput(value) {
    await this.page.keyboard.press(value);
  }

  async typeInput(value) {
    return await this.page.keyboard.type(value);
  }

  async typeCity(value, enter = false) {
    await this.typeInput(value);
    await this.sleep(500);
    if (enter) return await this.pressInput("Enter");
  }

  async typeCities(cities) {
    await this.typeCity(cities.first_city, true);
    await this.tab();
    await this.typeCity(cities.last_city, true);
  }

  async setPeoplesByType(type, value, constants = new Constants()) {
    if (value === 0 || (type === constants.adults && value === 1)) return;
    let number = type === constants.adults && value > 1 ? value - 1 : value;
    for (let i = 0; i < number; i++) {
      await this.pressInput("Enter");
    }
  }

  async setPeoples(peoples, constants = new Constants()) {
    let trip = await this.searchElementByText("*", constants.trip);
    await trip.click();
    await this.sleep(500);
    await this.tab();
    await this.pressInput("Enter");
    await this.tab();
    for (const keys in peoples) {
      await this.sleep(500);
      await this.setPeoplesByType(keys, peoples[keys]);
      if (peoples[keys] !== 0) await this.tab();
    }
    let confirm = await this.searchElementByText("span", constants.ok);
    await confirm.click();
    await this.sleep(500);
  }

  async setDates(dates, constants = new Constants()) {
    const isDatePlaceholder = (date) => date === "/";
    const isBothDatesPlaceholder =
      isDatePlaceholder(dates.first_date) && isDatePlaceholder(dates.last_date);

    if (isBothDatesPlaceholder) {
      for (let i = 0; i < 4; i++) {
        await this.tab();
      }

      let confirm = await this.searchElementByText("span", constants.research);
      await confirm.click();
      await this.sleep(2000);

      const next = await this.page.$$(
        ".VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-MV7yeb.VfPpkd-LgbsSe-OWXEXe-Bz112c-M1Soyc.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.b9hyVd.MQas1c.LQeN7.qhgRYc.CoZ57.CtwNgb.HhfOU.a2rVxf"
      );

      for (let i = 0; i < 11; i++) {
        await next[1].click();
        await this.sleep(3000);
      }

      let buttons = await this.page.$$(".CylAxb");
      let result = await Promise.all(
        buttons.map(async (t) => {
          return await t.evaluate((x) => x.textContent);
        })
      );

      let groupedResult = [];
      for (let i = 0; i < result.length; i += 2) {
        if (result[i + 1]) groupedResult.push([`${result[i]}`, result[i + 1]]);
      }

      var file = fs.createWriteStream(`output.txt`);
      groupedResult.forEach((v) => {
        file.write(v.join(", ") + "\n");
      });
      file.end();
      // need to refacto
    } else {
      for (const key in dates) {
        // Todo later
        if (Object.hasOwnProperty.call(dates, key)) {
          await this.sleep(500);
          await this.typeInput(dates[key]);
          await this.tab();
        }
      }
    }
  }

  async completeForm(parameters) {
    await this.sleep(1000);
    await this.tab(true);
    await this.typeCities(parameters.cities);
    await this.setPeoples(parameters.peoples);
    await this.setDates(parameters.dates);
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
    const [firstDate = null, lastDate = null, firstCity, lastCity] =
      answers.slice(1);

    return {
      peoples: {
        adults: Number(adults),
        childrens: Number(childrens),
        babies: Number(babies),
      },
      dates: {
        first_date: firstDate,
        last_date: lastDate,
      },
      cities: {
        first_city: firstCity,
        last_city: lastCity,
      },
    };
  }
}

module.exports = { CLIActions, WebActions };
