const { ButtonInteraction } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const { paginationUpdate } = require("../../functions/paginationUpdate");

module.exports = {
  customId: "previous",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.user.id !== interaction.user.id) { return interaction.reply({ content: "You are not the owner of this button.", ephemeral: true }); }
    
    let currentPage = client.currentPage;
    if (currentPage > 0) {
      currentPage--;
      client.currentPage = currentPage; // Update the current page on the client object
      await paginationUpdate(interaction, client.pages, currentPage);
    }
  },
};
