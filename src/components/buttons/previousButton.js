const { ButtonInteraction } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const { paginationUpdate } = require("../../functions/paginationUpdate");

module.exports = {
  customId: "previous",
  public: false,
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    let currentPage = client.currentPage;
    if (currentPage > 0) {
      currentPage--;
      client.currentPage = currentPage;
      await paginationUpdate(interaction, client.pages, currentPage);
    }
  },
};
