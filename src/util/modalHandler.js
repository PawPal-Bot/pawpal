const { readdirSync } = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const { ChalkAdvanced } = require("chalk-advanced");

module.exports = class ModalHandler {
  constructor(client) {
    this.client = client;
    this.client.modals = new Collection();
  }

  /**
   * Load the modals
   */
  load() {
    for (const file of readdirSync(path.join(__dirname, "..", "modals")).filter(
      (file) => file.endsWith(".js")
    )) {
      const modal = require(`../modals/${file}`);
      this.client.modals.set(modal.data.name, modal);
    }
    console.log(
      `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
        ">"
      )} ${ChalkAdvanced.green("Successfully loaded modals")}`
    );
  }

  /**
   * Reload the modals
   */
  reload() {
    this.client.modals = new Collection();
    this.load();
  }
};
