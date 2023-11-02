const valueDrainInterval = require("./valueDrainInterval");
const ageUpdateInterval = require("./ageUpdateInterval");

module.exports = (client) => {
  console.log("Starting intervals...");

  setInterval(valueDrainInterval, 3600000); // Start the value drain interval
  setInterval(ageUpdateInterval, 3600000); // Start the age update interval

  console.log("Intervals started.");
};
