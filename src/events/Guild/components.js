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
      const baseCustomId = parts[0];

      if (interaction.isButton()) {
        component = client.collection.components.buttons.get(baseCustomId);
      } else if (interaction.isAnySelectMenu()) {
        component = client.collection.components.selects.get(interaction.customId);
      } else if (interaction.isModalSubmit()) {
        component = client.collection.components.modals.get(interaction.customId);
      }

      if (component) {
        try {
          await component.run(client, interaction);
        } catch (error) {
          console.error(error);
        }
      } else {
        if (interaction.isButton()) {
          const pageIndex = parseInt(parts[parts.length - 1], 10);
          component = client.collection.components.buttons.get(baseCustomId);

          if (component) {
            try {
              component.run(client, interaction, pageIndex);
            } catch (error) {
              console.error(error);
            }
          } else {
            console.log(`No component found for customId: ${interaction.customId}`);
          }
        }
        // No additional handling for select menus or modals here
      }
    }
  },
};
