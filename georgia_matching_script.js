const Fuse = require("fuse.js");
const xlsx = require("xlsx");

function removeDuplicatesArr(arr) {
  return [...new Set(arr)];
}

function normalizeHotelName(name) {
  return name
    .replace(/^\s*["']\s*|\s*["']\s*$/g, "") // Remove leading/trailing quotes
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/(\d\s?\*+|\*+\s?\d)/g, (match) => {
      const stars = match.replace(/\D/g, ""); // Remove non-digit characters
      return `${stars}*`;
    })
    .replace(/\s+/g, " ") // Remove extra spaces
    .trim()
    .toLowerCase(); // Make case-insensitive
}

// Normalize all hotel names in datasets
function normalizeDataset(dataset) {
  return dataset.map(normalizeHotelName);
}

const options = {
  includeScore: true,
  threshold: 0.85,
};

// Function to process Georgian datasets city by city
function processGeorgianDatasets(
  template,
  onlineCentrum,
  kompastour,
  funSun,
  easyBooking,
  prestigeUZ
) {
  const results = [];
  const unmatchedHotels = {};

  for (const city in template) {
    if (Object.hasOwnProperty.call(template, city)) {
      const cityTemplateHotels = removeDuplicatesArr(
        normalizeDataset(template[city])
      );
      const cityOnlineCentrumHotels = removeDuplicatesArr(
        normalizeDataset(onlineCentrum[city] || [])
      );
      const cityKompastourHotels = removeDuplicatesArr(
        normalizeDataset(kompastour[city] || [])
      );
      const cityFunSunHotels = removeDuplicatesArr(
        normalizeDataset(funSun[city] || [])
      );
      const cityEasyBookingHotels = removeDuplicatesArr(
        normalizeDataset(easyBooking[city] || [])
      );
      const cityPrestigeUZHotels = removeDuplicatesArr(
        normalizeDataset(prestigeUZ[city] || [])
      );

      const cityDatasets = [
        {
          name: "Online Centrum",
          fuse: new Fuse(cityOnlineCentrumHotels, options),
          unmatchedHotels: cityOnlineCentrumHotels.slice(),
        },
        {
          name: "Kompastour",
          fuse: new Fuse(cityKompastourHotels, options),
          unmatchedHotels: cityKompastourHotels.slice(),
        },
        {
          name: "FunSun",
          fuse: new Fuse(cityFunSunHotels, options),
          unmatchedHotels: cityFunSunHotels.slice(),
        },
        {
          name: "EasyBooking",
          fuse: new Fuse(cityEasyBookingHotels, options),
          unmatchedHotels: cityEasyBookingHotels.slice(),
        },
        {
          name: "PrestigeUZ",
          fuse: new Fuse(cityPrestigeUZHotels, options),
          unmatchedHotels: cityPrestigeUZHotels.slice(),
        },
      ];

      const cityResults = matchHotels(cityTemplateHotels, cityDatasets);

      // Adding city name as a new row
      results.push({
        "Template Hotel": `City: ${city}`,
        "Online Centrum": "",
        Kompastour: "",
        FunSun: "",
        EasyBooking: "",
        PrestigeUZ: "",
      });

      // Adding matched hotels
      results.push(...createTableData(cityResults));

      // Add row indicating the start of using the next column as reference
      results.push({
        "Template Hotel": `NOW COMPARING TO UNMATCHED HOTELS USING ONLINE CENTRUM AS REFERENCE`,
        "Online Centrum": "",
        Kompastour: "",
        FunSun: "",
        EasyBooking: "",
        PrestigeUZ: "",
      });

      // Continue with unmatched hotels from the first dataset
      const unmatchedOnlineCentrum = cityDatasets.find(
        (d) => d.name === "Online Centrum"
      ).unmatchedHotels;
      const unmatchedResults = matchHotels(
        unmatchedOnlineCentrum,
        cityDatasets.filter((d) => d.name !== "Online Centrum")
      );

      results.push(...createTableData(unmatchedResults));

      // Add row indicating the start of using Kompastour as reference
      results.push({
        "Template Hotel": `NOW COMPARING TO UNMATCHED HOTELS USING KOMPASTOUR AS REFERENCE`,
        "Online Centrum": "",
        Kompastour: "",
        FunSun: "",
        EasyBooking: "",
        PrestigeUZ: "",
      });

      // Match remaining unmatched hotels using Kompastour as reference
      const unmatchedKompastour = cityDatasets.find(
        (d) => d.name === "Kompastour"
      ).unmatchedHotels;
      const unmatchedKompastourResults = matchHotels(
        unmatchedKompastour,
        cityDatasets.filter((d) => d.name !== "Kompastour")
      );

      results.push(...createTableData(unmatchedKompastourResults));

      // Add row indicating the start of using FunSun as reference
      results.push({
        "Template Hotel": `NOW COMPARING TO UNMATCHED HOTELS USING FUNSUN AS REFERENCE`,
        "Online Centrum": "",
        Kompastour: "",
        FunSun: "",
        EasyBooking: "",
        PrestigeUZ: "",
      });

      // Match remaining unmatched hotels using FunSun as reference
      const unmatchedFunSun = cityDatasets.find(
        (d) => d.name === "FunSun"
      ).unmatchedHotels;
      const unmatchedFunSunResults = matchHotels(
        unmatchedFunSun,
        cityDatasets.filter((d) => d.name !== "FunSun")
      );

      results.push(...createTableData(unmatchedFunSunResults));

      // Add row indicating the start of using EasyBooking as reference
      results.push({
        "Template Hotel": `NOW COMPARING TO UNMATCHED HOTELS USING EASYBOOKING AS REFERENCE`,
        "Online Centrum": "",
        Kompastour: "",
        FunSun: "",
        EasyBooking: "",
        PrestigeUZ: "",
      });

      // Match remaining unmatched hotels using EasyBooking as reference
      const unmatchedEasyBooking = cityDatasets.find(
        (d) => d.name === "EasyBooking"
      ).unmatchedHotels;
      const unmatchedEasyBookingResults = matchHotels(
        unmatchedEasyBooking,
        cityDatasets.filter((d) => d.name !== "EasyBooking")
      );

      results.push(...createTableData(unmatchedEasyBookingResults));

      // Add row indicating the start of using PrestigeUZ as reference
      results.push({
        "Template Hotel": `NOW COMPARING TO UNMATCHED HOTELS USING PRESTIGEUZ AS REFERENCE`,
        "Online Centrum": "",
        Kompastour: "",
        FunSun: "",
        EasyBooking: "",
        PrestigeUZ: "",
      });

      // Match remaining unmatched hotels using PrestigeUZ as reference
      const unmatchedPrestigeUZ = cityDatasets.find(
        (d) => d.name === "PrestigeUZ"
      ).unmatchedHotels;
      const unmatchedPrestigeUZResults = matchHotels(
        unmatchedPrestigeUZ,
        cityDatasets.filter((d) => d.name !== "PrestigeUZ")
      );

      results.push(...createTableData(unmatchedPrestigeUZResults));
    }
  }

  return results;
}

// Function to find best match for a hotel in a dataset
function findBestMatch(hotelName, fuseInstance) {
  const result = fuseInstance.search(hotelName);
  return result.length > 0 ? result[0].item : null;
}

// Main matching function
function matchHotels(templateHotels, datasets) {
  const matches = {};

  templateHotels.forEach((templateHotel) => {
    matches[templateHotel] = { templateHotel };

    datasets.forEach((dataset) => {
      const bestMatch = findBestMatch(templateHotel, dataset.fuse);
      if (bestMatch) {
        matches[templateHotel][dataset.name] = bestMatch;
        dataset.unmatchedHotels = dataset.unmatchedHotels.filter(
          (hotel) => hotel !== bestMatch
        );
      } else {
        matches[templateHotel][dataset.name] = null;
      }
    });
  });

  return matches;
}

// Function to create table data for Excel
function createTableData(matches) {
  const tableData = [];

  for (const [templateHotel, match] of Object.entries(matches)) {
    const row = {
      "Template Hotel": match.templateHotel,
      "Online Centrum": match["Online Centrum"] || "",
      Kompastour: match["Kompastour"] || "",
      FunSun: match["FunSun"] || "",
      EasyBooking: match["EasyBooking"] || "",
      PrestigeUZ: match["PrestigeUZ"] || "",
    };
    tableData.push(row);
  }

  return tableData;
}

// Process Georgian datasets city by city and prepare the final results
const finalResults = processGeorgianDatasets(
  georgianTemplateHotels,
  onlineCentrumGeorgianHotels,
  kompastourGeorgianHotels,
  funSunGeorgianHotels,
  easyBookingGeorgianHotels,
  prestigeUZGeorgianHotels
);

console.log("Final matching results:", finalResults);

// Convert finalResults to worksheet
const worksheet = xlsx.utils.json_to_sheet(finalResults);

// Create a new workbook and append the worksheet
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Matched Hotels");

// Write the workbook to a file
xlsx.writeFile(workbook, "GEORGIA_MatchedHotels.xlsx");

console.log("Excel file created: GEORGIA_MatchedHotels.xlsx");
