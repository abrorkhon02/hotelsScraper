const puppeteer = require("puppeteer");
const fs = require("fs");

const webpages = [
  { name: "Centrum", url: "https://online-centrum-holidays.com/search_tour" },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HotelScraper {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
  }

  async scrapeHotelDataForCurrentPage(country, page) {
    const hotels = {};

    await page.waitForSelector(".STATEINC_chosen a", {
      visible: true,
      timeout: 60000,
    });

    await this.selectCountry(page, country);
    await delay(3000);

    const hotelNames = await page.evaluate(() => {
      const hotelLabels = Array.from(
        document.querySelectorAll(".checklistbox.HOTELS label:not(.hidden)")
      );
      return hotelLabels.map((label) => label.textContent.trim());
    });

    console.log(`Hotel names data for ${country} has been collected`);

    hotels[country] = hotelNames;

    return hotels;
  }

  async scrapeHotelsByCountry(country) {
    const allData = {}; // Object to store data for all webpages

    for (const webpage of webpages) {
      try {
        const page = await this.browser.newPage();
        await page.goto(webpage.url);

        const webpageData = await this.scrapeHotelDataForCurrentPage(
          country,
          page
        );
        console.log(`Scraped data for ${webpage.name}:`, webpageData);

        allData[webpage.name] = webpageData;

        await page.close();
      } catch (error) {
        console.error(`Error setting up scraping for ${webpage.name}:`, error);
      }
    }

    // Save the collected data to a JSON file
    const jsonData = JSON.stringify(allData, null, 2);
    fs.writeFileSync("hotel_data.json", jsonData);
    console.log("Hotel data saved to hotel_data.json");
  }

  async selectCountry(page, country) {
    await page.click(".STATEINC_chosen a");
    await page.waitForSelector(".chosen-drop .chosen-results .active-result", {
      visible: true,
    });
    await delay(500);

    await page.evaluate((country) => {
      const options = Array.from(
        document.querySelectorAll(".chosen-drop .chosen-results .active-result")
      );
      const targetOption = options.find(
        (option) => option.textContent.trim() === country
      );
      if (targetOption) {
        targetOption.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true, cancelable: true })
        );
        targetOption.dispatchEvent(
          new MouseEvent("mouseup", { bubbles: true, cancelable: true })
        );
        targetOption.click();
      }
    }, country);
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = HotelScraper;
