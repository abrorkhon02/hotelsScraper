const puppeteer = require("puppeteer");
const fs = require("fs");

const webpages = [
  { name: "Centrum", url: "https://online-centrum-holidays.com/search_tour" },
  { name: "Kompas", url: "https://online.kompastour.kz/search_tour" },
  { name: "FunSun", url: "https://b2b.fstravel.asia/search_tour" },
  { name: "EasyBooking", url: "https://tours.easybooking.uz/search_tour" },
  { name: "Prestige", url: "http://online.uz-prestige.com/search_tour" },
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

  async scrapeHotelDataForCurrentPage(
    webpageName,
    country,
    possibleCityNames,
    page
  ) {
    const scrapedData = {};

    await page.waitForSelector(".STATEINC_chosen a", {
      visible: true,
      timeout: 60000,
    });

    await this.selectCountry(page, country);
    await delay(3000);

    await page.waitForSelector(".checklistbox.TOWNS", {
      visible: true,
      timeout: 60000,
    });

    for (const cityName of possibleCityNames) {
      await this.selectCity(page, cityName);
      await delay(3000);

      const hotels = await page.evaluate(() => {
        const hotelLabels = Array.from(
          document.querySelectorAll(".checklistbox.HOTELS label:not(.hidden)")
        );
        return hotelLabels.map((label) => label.textContent.trim());
      });

      console.log(`Hotel names data from ${cityName} has been collected`);

      scrapedData[cityName] = {
        [webpageName]: hotels,
      };

      await this.uncheckCity(page, cityName);
      await delay(3000);
    }

    return scrapedData;
  }

  async scrapeHotelsByCity(country, possibleCityNames) {
    const allData = {}; // Object to store data for all webpages

    const pagePromises = webpages.map(async (webpage) => {
      try {
        const page = await this.browser.newPage();
        await page.goto(webpage.url);

        await this.injectStartButton(page);

        await page.exposeFunction("startScraping", async () => {
          console.log(
            `Scraping started from the browser button for ${webpage.name}!`
          );
          const webpageData = await this.scrapeHotelDataForCurrentPage(
            webpage.name,
            country,
            possibleCityNames,
            page
          );
          console.log(`Scraped data for ${webpage.name}:`, webpageData);

          // Merge webpageData into allData
          for (const city in webpageData) {
            if (!allData[city]) {
              allData[city] = {};
            }
            allData[city] = { ...allData[city], ...webpageData[city] };
          }

          await page.close();
        });

        await page.evaluate(() => {
          const button = document.getElementById("startScrapingButton");
          button.addEventListener("click", () => {
            window.startScraping();
          });
        });

        await new Promise(() => {});
      } catch (error) {
        console.error(`Error setting up scraping for ${webpage.name}:`, error);
      }
    });

    await Promise.all(pagePromises);
    console.log("Scraping completed for all pages.");

    // Save the collected data to a JSON file
    const jsonData = JSON.stringify({ [country]: allData }, null, 2);
    fs.writeFileSync("hotel_data.json", jsonData);
    console.log("Hotel data saved to hotel_data.json");
  }

  async injectStartButton(page) {
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.id = "startScrapingButton";
      button.textContent = "Start Scraping";
      button.style.position = "fixed";
      button.style.top = "10px";
      button.style.left = "10px";
      button.style.zIndex = "9999";
      document.body.appendChild(button);
    });
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

  async selectCity(page, cityName) {
    const result = await page.evaluate((cityName) => {
      const groups = document.querySelectorAll(
        ".control_townto .groupbox .groupname"
      );
      for (const group of groups) {
        if (group.textContent.trim() === cityName) {
          const checkbox = group.querySelector('input[type="checkbox"]');
          if (checkbox && !checkbox.checked) {
            checkbox.click();
            return true;
          }
        }
      }
      return false;
    }, cityName);

    if (!result) {
      console.log(`City name "${cityName}" not found.`);
    } else {
      console.log(`City "${cityName}" selected.`);
    }
    await delay(500);
  }

  async uncheckCity(page, cityName) {
    await page.evaluate((cityName) => {
      const groups = document.querySelectorAll(
        ".control_townto .groupbox .groupname"
      );
      for (const group of groups) {
        if (group.textContent.trim() === cityName) {
          const checkbox = group.querySelector('input[type="checkbox"]');
          if (checkbox && checkbox.checked) {
            checkbox.click();
          }
        }
      }
    }, cityName);
    await delay(500);
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = HotelScraper;
