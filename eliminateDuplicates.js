const fs = require("fs");
const vm = require("vm");

// Read the contents of the file
const data = fs.readFileSync("./datasets.js", "utf8");

// Create a sandbox and run the script in that context
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(data, sandbox);

// Function to remove duplicates from arrays within an object
function removeDuplicatesFromObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const uniqueValues = Array.from(new Set(obj[key]));
      obj[key] = uniqueValues;
    }
  }
}

// Function to remove duplicates from a flat array
function removeDuplicatesFromArray(arr) {
  return Array.from(new Set(arr));
}

// Ensure the variables are defined

// Remove duplicates in georgiaTemplateHotels
removeDuplicatesFromObject(sandbox.georgiaTemplateHotels);
// Remove duplicates in uaeTemplateHotels
sandbox.uaeTemplateHotels = removeDuplicatesFromArray(
  sandbox.uaeTemplateHotels
);
// Remove duplicates in onlineCentrumGeorgianHotels
removeDuplicatesFromObject(sandbox.onlineCentrumGeorgianHotels);
// Remove duplicates in onlineCentrumUAEHotels
sandbox.onlineCentrumUAEHotels = removeDuplicatesFromArray(
  sandbox.onlineCentrumUAEHotels
);

// Convert the object back to a string
const updatedData = `
const georgiaTemplateHotels = ${JSON.stringify(
  sandbox.georgiaTemplateHotels,
  null,
  2
)};
const uaeTemplateHotels = ${JSON.stringify(sandbox.uaeTemplateHotels, null, 2)};
const onlineCentrumGeorgianHotels = ${JSON.stringify(
  sandbox.onlineCentrumGeorgianHotels,
  null,
  2
)};
const onlineCentrumUAEHotels = ${JSON.stringify(
  sandbox.onlineCentrumUAEHotels,
  null,
  2
)};
`;

// Write the updated data back to the file
fs.writeFileSync("./updated_datasets.js", updatedData, "utf8");

console.log("Duplicates removed and file updated.");
