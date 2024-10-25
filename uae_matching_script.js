const Fuse = require("fuse.js");
const xlsx = require("xlsx");

function removeDuplicatesArr(arr) {
  return [...new Set(arr)];
}

function normalizeHotelName(name) {
  return name
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

// Remove duplicates and normalize names from all UAE datasets
const uaeTemplateHotelsWithoutDuplicates = removeDuplicatesArr(
  normalizeDataset(uaeTemplateHotels)
);
const onlineCentrumUAEHotelsWithoutDuplicates = removeDuplicatesArr(
  normalizeDataset(onlineCentrumUAEHotels)
);
const kompastourUAEHotelsWithoutDuplicates = removeDuplicatesArr(
  normalizeDataset(kompastourUAEHotels)
);
const funSunUAEHotelsWithoutDuplicates = removeDuplicatesArr(
  normalizeDataset(funSunUAEHotels)
);
const easyBookingUAEHotelsWithoutDuplicates = removeDuplicatesArr(
  normalizeDataset(easyBookingUAEHotels)
);
const prestigeUZUAEHotelsWithoutDuplicates = removeDuplicatesArr(
  normalizeDataset(prestigeUZUAEHotels)
);

console.log("Removed duplicates from datasets and normalized names:");
console.log("UAE Template Hotels:", uaeTemplateHotelsWithoutDuplicates.length);
console.log("Online Centrum:", onlineCentrumUAEHotelsWithoutDuplicates.length);
console.log("Kompastour:", kompastourUAEHotelsWithoutDuplicates.length);
console.log("FunSun:", funSunUAEHotelsWithoutDuplicates.length);
console.log("EasyBooking:", easyBookingUAEHotelsWithoutDuplicates.length);
console.log("PrestigeUZ:", prestigeUZUAEHotelsWithoutDuplicates.length);

// Fuse.js options for fuzzy matching
const options = {
  includeScore: true,
  threshold: 0.75,
};

// Create Fuse instances for each dataset
const fuseOnlineCentrum = new Fuse(
  onlineCentrumUAEHotelsWithoutDuplicates,
  options
);
const fuseKompastour = new Fuse(kompastourUAEHotelsWithoutDuplicates, options);
const fuseFunSun = new Fuse(funSunUAEHotelsWithoutDuplicates, options);
const fuseEasyBooking = new Fuse(
  easyBookingUAEHotelsWithoutDuplicates,
  options
);
const fusePrestigeUZ = new Fuse(prestigeUZUAEHotelsWithoutDuplicates, options);

console.log("Created Fuse instances for datasets");

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

// Initialize unmatched hotels array for each dataset
const datasets = [
  {
    name: "Online Centrum",
    fuse: fuseOnlineCentrum,
    unmatchedHotels: onlineCentrumUAEHotelsWithoutDuplicates.slice(),
  },
  {
    name: "Kompastour",
    fuse: fuseKompastour,
    unmatchedHotels: kompastourUAEHotelsWithoutDuplicates.slice(),
  },
  {
    name: "FunSun",
    fuse: fuseFunSun,
    unmatchedHotels: funSunUAEHotelsWithoutDuplicates.slice(),
  },
  {
    name: "EasyBooking",
    fuse: fuseEasyBooking,
    unmatchedHotels: easyBookingUAEHotelsWithoutDuplicates.slice(),
  },
  {
    name: "PrestigeUZ",
    fuse: fusePrestigeUZ,
    unmatchedHotels: prestigeUZUAEHotelsWithoutDuplicates.slice(),
  },
];

// Perform matching using the template hotels as the initial reference
let results = matchHotels(uaeTemplateHotelsWithoutDuplicates, datasets);

console.log("Initial matching results:", results);

// Function to match unmatched hotels among remaining datasets
function matchRemainingHotels(datasets) {
  let remainingResults = {};

  datasets.forEach((dataset, index) => {
    const otherDatasets = datasets
      .slice(0, index)
      .concat(datasets.slice(index + 1));

    remainingResults = {
      ...remainingResults,
      ...matchHotels(dataset.unmatchedHotels, otherDatasets),
    };
  });

  return remainingResults;
}

// Continue with unmatched hotels from the first dataset
const unmatchedOnlineCentrum = datasets.find(
  (d) => d.name === "Online Centrum"
).unmatchedHotels;
results = {
  ...results,
  ...matchHotels(
    unmatchedOnlineCentrum,
    datasets.filter((d) => d.name !== "Online Centrum")
  ),
};

console.log("Matching results after unmatched online centrum:", results);

// Match remaining unmatched hotels across all datasets
const remainingResults = matchRemainingHotels(datasets);
results = {
  ...results,
  ...remainingResults,
};

console.log("Final matching results after unmatched:", results);

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

  // Add the additional row to indicate the change in reference
  tableData.push({
    "Template Hotel":
      "NOW COMPARING TO THE ONLINE CENTRUM HOTEL NAMES AS A REFERENCE",
    "Online Centrum": "",
    Kompastour: "",
    FunSun: "",
    EasyBooking: "",
    PrestigeUZ: "",
  });

  return tableData;
}

const tableData = createTableData(results);
console.log("Table data prepared for Excel:", tableData);

// Convert tableData to worksheet
const worksheet = xlsx.utils.json_to_sheet(tableData);

// Create a new workbook and append the worksheet
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Matched Hotels");

// Write the workbook to a file
xlsx.writeFile(workbook, "MatchedHotels.xlsx");

console.log("Excel file created: MatchedHotels.xlsx");
