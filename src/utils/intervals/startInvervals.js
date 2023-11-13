const valueDrainInterval = require("./valueDrainInterval");
const ageUpdateInterval = require("./ageUpdateInterval");
const { log } = require("../../functions");

module.exports = (client) => {
  log("Starting intervals...", "info");

  ageUpdateInterval();

  setInterval(valueDrainInterval, 3600000);
  setInterval(ageUpdateInterval, 3600000); 

  log("Intervals started.", "done");
};
