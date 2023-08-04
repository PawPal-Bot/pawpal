const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
module.exports = {
  data: {
    name: "declineAdoption",
    description: "Select menu for the adopt command",
  },
  async execute(interaction, client, userDb) {
    const acceptAdoptionButton = new ButtonBuilder()
      .setCustomId("acceptAdoption")
      .setLabel("Accept")
      .setStyle("Success")
      .setDisabled(true)
      .setEmoji("✅");

    const declineAdoptionButton = new ButtonBuilder()
      .setCustomId("declineAdoption")
      .setLabel("Cancel")
      .setStyle("Danger")
      .setDisabled(true)
      .setEmoji("❌");

    await interaction.update({
      components: [
        new ActionRowBuilder().addComponents(
          acceptAdoptionButton,
          declineAdoptionButton,
        ),
      ],
    });
    interaction.followUp({
      content: "You have cancelled the adoption process. Your pet is safe!",
      ephemeral: true,
    });
  },
};
