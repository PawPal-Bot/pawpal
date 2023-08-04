const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
  data: {
    name: "removeAdoption",
    description: "Put one of your pets up for adoption!",
  },
  async execute(interaction, client, userDb) {
    const removeAdoptionEmbed = new EmbedBuilder()
      .setTitle("Put your pet up for adoption!")
      .setDescription(
        "Do you really wish to put your pet up for adoption? This action cannot be undone!",
      )
      .setColor("#9e38fe");

    const acceptAdoptionButton = new ButtonBuilder()
      .setCustomId("acceptAdoption")
      .setLabel("Proceed")
      .setStyle("Success")
      .setEmoji("✅");

    const declineAdoptionButton = new ButtonBuilder()
      .setCustomId("declineAdoption")
      .setLabel("Cancel")
      .setStyle("Danger")
      .setEmoji("❌");

    interaction.update({
      embeds: [removeAdoptionEmbed],
      components: [
        new ActionRowBuilder().addComponents(
          acceptAdoptionButton,
          declineAdoptionButton,
        ),
      ],
    });
  },
};
