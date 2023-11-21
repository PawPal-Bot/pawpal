const { ButtonInteraction } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const { paginationUpdate } = require("../../functions/paginationUpdate");

module.exports = {
  customId: "first",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.user.id !== interaction.user.id) { return interaction.reply({ content: "You are not the owner of this button.", ephemeral: true }); }
    const currentPage = 0;
    client.currentPage = currentPage;
    await paginationUpdate(interaction, client.pages, currentPage);
  },
};
