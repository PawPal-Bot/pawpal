const { readdir } = require("fs");
const path = require("path");
const ChalkAdvanced = require("chalk-advanced");

module.exports = class EventHandler {
  constructor(client) {
    this.client = client;
    this.once = ["ready"];
  }

  load() {
    readdir(path.join(__dirname, "..", "events"), (err, files) => {
      if (err) return console.error(err);

      files
        .filter((file) => file.endsWith(".js"))
        .forEach((file) => {
          try {
            const event = require(path.join(__dirname, "..", "events", file));
            let eventName = file.split(".")[0];

            if (this.once.includes(eventName)) {
              this.client.once(eventName, event.bind(null, this.client));
            } else {
              this.client.on(eventName, event.bind(null, this.client));
            }

            console.log(
              `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
                ">"
              )} ${ChalkAdvanced.green(`Loaded Event "${eventName}"`)}`
            );
          } catch (error) {
            console.error(
              `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
                ">"
              )} ${ChalkAdvanced.red(
                `Error loading event ${file}: ${error.message}`
              )}`
            );
          }
        });
    });
  }
};
