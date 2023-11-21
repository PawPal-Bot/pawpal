const { ButtonInteraction, MessageActionRow, ButtonBuilder, ButtonStyle } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "cancel",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.user.id !== interaction.user.id) { return interaction.reply({ content: "You are not the owner of this button.", ephemeral: true }); }
    
    await interaction.message.delete();
  },
};
