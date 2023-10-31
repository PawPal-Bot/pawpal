const AdoptMe = require("./src/util/client");
const ChalkAdvanced = require("chalk-advanced");

const client = new AdoptMe();

client.loginBot().then(() => {
  console.log(
    `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
      ">"
    )} ${ChalkAdvanced.green("Bot successfully started. ")}`
  );
});
