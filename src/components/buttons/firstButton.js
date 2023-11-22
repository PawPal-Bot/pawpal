const { ButtonInteraction } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const { paginationUpdate } = require("../../functions/paginationUpdate");

module.exports = {
  customId: "first",
  public: false,
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const currentPage = 0;
    client.currentPage = currentPage;
    await paginationUpdate(interaction, client.pages, currentPage);
  },
};
