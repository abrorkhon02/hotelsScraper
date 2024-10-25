function normalizeHotelName(name) {
  return name
    .replace(/^\s*["']\s*|\s*["']\s*$/g, "") // Remove leading/trailing quotes
    .replace(/\s*\([^)]*\)\s*/g, "") // Remove text in parentheses
    .replace(/(\d\s?\*+|\*+\s?\d)/g, (match) => {
      const stars = match.replace(/\D/g, ""); // Extract digit characters
      return ` ${stars}* `; // Ensure space around stars
    })
    .replace(/\s+/g, " ") // Remove extra spaces
    .trim()
    .toLowerCase(); // Make case-insensitive
}

// Example usage:
const testNames = [
  "hotel name 5*",
  "another name(near beach)4*",
  "another name (near beach) 4*",
  "example hotel5*",
  "test hotel 3***",
  "simple name",
  "hotel 'quoted' 5*",
  "hotel 5 stars *****",
  "Swissotel Al Murooj ***** (Downtown) ",
];

testNames.forEach((name) => {
  console.log(normalizeHotelName(name));
});
