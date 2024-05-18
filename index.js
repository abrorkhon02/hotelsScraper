const HotelScraper = require("./hotelScraper");
const fs = require("fs");

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

function getDistinctValues(arr) {
  return [...new Set(arr)];
}

for (const country in countries) {
  countries[country] = getDistinctValues(countries[country]);
}

(async () => {
  const scraper = new HotelScraper();
  await scraper.initialize();

  for (const countryName in countries) {
    const cities = countries[countryName];
    console.log(`Setting up pages for ${countryName}...`);
    await scraper.scrapeHotelsByCity(countryName, cities);
  }
})();
