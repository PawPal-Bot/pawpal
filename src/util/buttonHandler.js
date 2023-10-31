const { readdirSync } = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const { ChalkAdvanced } = require("chalk-advanced");

module.exports = class ButtonHandler {
  constructor(client) {
    this.client = client;
    this.client.buttons = new Collection();
  }

  /**
   * Load the buttons
   */
  async load() {
    const buttonDir = path.resolve(__dirname, "..", "buttons");
    try {
      for (const file of readdirSync(buttonDir).filter((file) =>
        file.endsWith(".js")
      )) {
        try {
          const button = await import(path.resolve(buttonDir, file));
          const buttonDefault = button.default;
          this.client.buttons.set(buttonDefault.data.name, buttonDefault);
        } catch (err) {
          console.error(
            `${ChalkAdvanced.red("Error loading button from file:")} ${file}`,
            err
          );
        }
      }
      console.log(
        `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
          ">"
        )} ${ChalkAdvanced.green("Successfully loaded buttons")}`
      );
    } catch (err) {
      console.error(
        `${ChalkAdvanced.red("Error reading buttons directory:")}`,
        err
      );
    }
  }

  /**
   * Reload the buttons
   */
  async reload() {
    this.client.buttons = new Collection();
    await this.load();
  }
};
