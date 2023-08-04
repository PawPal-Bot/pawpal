const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
module.exports = {
  data: {
    name: "acceptAdoption",
    description: "Select menu for the adopt command",
  },
  async execute(interaction, client, userDb) {

    await userModel
      .findOneAndUpdate(
        { userId: interaction.user.id },
        { hasPet: false, petType: 0 },
        { upsert: true }
      )
      .exec();

    interaction.update({
      content: "You sucessfully put up your pet for adoption!",
      embeds: [],
      components: [],
    });
  },
};
