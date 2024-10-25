const HotelScraper = require("./hotelScraper");

const countries = {
  Грузия: [
    "ADJARA",
    "Gudauri",
    "Gurjaani",
    "Imereti",
    "Kazbegi",
    "Kvareli",
    "Lagodekhi",
    "Mtskheta",
    "Samegrelo-Upper Svaneti",
    "Samtskhe-Javakheti",
    "Shekvetili",
    "TBILISI",
    "Кахетия",
    "Телави",
    "Аджария",
    "Имеретия",
    "Самцхе-Джавахети",
    "Экскурсии",
    "Батуми",
    "Боржоми",
    "Кобулети",
    "Шекветили",
    "Гурия",
    "Лечебные туры",
  ],
  ОАЭ: [
    "ABU DHABI",
    "AJMAN",
    "DUBAI",
    "FUJAIRAH",
    "RAS AL KHAIMAH",
    "SHARJAH",
    "UMM AL QUWAIN",
    "Abu Dhabi",
    "Ajman",
    "Dubai",
    "Fujairah",
    "Ras Al Khaimah",
    "Sharjah",
    "Umm Al Quwain",
    "Абу-Даби",
    "Аджман",
    "Дубай",
    "Рас-эль-Хайма",
    "Умм-Аль-Кувейн",
    "Фуджейра",
    "Умм-аль-Кувейн",
  ],
};

(async () => {
  const scraper = new HotelScraper();
  await scraper.initialize();

  for (const countryName in countries) {
    console.log(`Scraping hotels for ${countryName}...`);
    await scraper.scrapeHotelsByCountry(countryName);
  }

  await scraper.close();
})();
