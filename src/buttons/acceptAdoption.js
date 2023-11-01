const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");

module.exports = {
  data: {
    name: "acceptAdoption",
    description: "Select menu for the adopt command",
  },
  async execute(interaction, client, userDb) {
    await userModel.deleteOne({ userId: interaction.user.id }).exec();

    interaction.update({
      content: "You successfully put up your pet for adoption!",
      embeds: [],
      components: [],
    });
  },
};
