const config = require("../../config");
const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  event: "interactionCreate",
  /**
   *
   * @param {ExtendedClient} client
   * @param {import('discord.js').Interaction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
      let component;

      const parts = interaction.customId.split("_");
      let baseCustomId = parts[0];
      let pageIndex = NaN;

      if (interaction.isButton()) {
        component = client.collection.components.buttons.get(interaction.customId);

        if (!component && parts.length > 1) {
          pageIndex = parseInt(parts[parts.length - 1], 10);
          baseCustomId = isNaN(pageIndex) ? interaction.customId : parts.slice(0, -1).join("_");
          component = client.collection.components.buttons.get(baseCustomId);
        }
      } else if (interaction.isAnySelectMenu()) {
        component = client.collection.components.selects.get(interaction.customId);
      } else if (interaction.isModalSubmit()) {
        component = client.collection.components.modals.get(interaction.customId);
      }

      if (component) {
        try {
          if (interaction.isButton() && !isNaN(pageIndex)) {
            await component.run(client, interaction, pageIndex);
          } else {
            await component.run(client, interaction);
          }
        } catch (error) {
          log(error.message, "err");
        }
      } else {
        log(`No component found for customId: ${interaction.customId}`, "err");
      }
    }
  },
};
