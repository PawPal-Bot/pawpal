const {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("feed")
    .setDescription("Feed your pet a treat!"),

  async execute(interaction, client) {
    const userDb = await userModel.findOne({ userId: interaction.user.id });

    if (!userDb || !userDb.hasPet) {
      await interaction.reply("You don't have a pet to feed!");
      return;
    }

    const petName = userDb.petName ? userDb.petName : "Your pet";

    // Create buttons for feeding food and water
    const feedFoodButton = new ButtonBuilder()
      .setCustomId("feedFood")
      .setLabel("Give Food")
      .setStyle("Primary")
      .setEmoji("🍽️");

    const feedWaterButton = new ButtonBuilder()
      .setCustomId("feedWater")
      .setLabel("Give Water")
      .setStyle("Primary")
      .setEmoji("💧");

    // Create an ActionRow to house the buttons
    const actionRow = new ActionRowBuilder().addComponents(
      feedFoodButton,
      feedWaterButton
    );

    // Create an embed
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Feed ${petName}`)
      .setDescription(
        `Hello there! It seems like ${petName} is ready for a meal or a drink. What would you like to give them? 
        \nProviding a balanced diet of food and water will keep ${petName} happy and healthy.
        \nChoose an option below to feed or hydrate your adorable companion! 🍲💧`
      );

    // Reply with the embed and buttons
    await interaction.reply({
      embeds: [embed],
      components: [actionRow],
    });
  },
};
