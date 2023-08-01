const PawPal = require("./src/util/client");
const ChalkAdvanced = require("chalk-advanced");

const client = new PawPal();

client.loginBot().then(() => {
  console.log(
    `${ChalkAdvanced.white("PawPal Bot")} ${ChalkAdvanced.gray(
      ">"
    )} ${ChalkAdvanced.green("Bot sucessfully started. ")}`
  );
});
