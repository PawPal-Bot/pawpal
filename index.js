const AdoptMe = require("./src/util/client");
const ChalkAdvanced = require("chalk-advanced");
const startIntervals = require("./src/intervals/startIntervals");

const client = new AdoptMe();

client.loginBot().then(() => {
  console.log(
    `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
      ">"
    )} ${ChalkAdvanced.green("Bot successfully started. ")}`
  );
  startIntervals();
});
