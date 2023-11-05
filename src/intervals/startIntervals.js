const valueDrainInterval = require("./valueDrainInterval");
const ageUpdateInterval = require("./ageUpdateInterval");

module.exports = (client) => {
  console.log("Starting intervals...");

  setInterval(valueDrainInterval, 3600000);
  setInterval(ageUpdateInterval, 3600000); 

  console.log("Intervals started.");
};
