const {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamp = require("../util/timeStamp");

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

    // Get the timestamps of the last few feeding and drinking actions
    const lastFedTimes = userDb.actionTimestamps.lastFed;
    const lastDrankTimes = userDb.actionTimestamps.lastDrank;

    // Determine the time since the last actions
    const timeSinceLastFed =
      lastFedTimes.length > 0
        ? Date.now() - new Date(lastFedTimes.slice(-1)[0]).getTime()
        : Infinity;
    const timeSinceLastDrank =
      lastDrankTimes.length > 0
        ? Date.now() - new Date(lastDrankTimes.slice(-1)[0]).getTime()
        : Infinity;

    // Determine the message to show based on the time since the last actions
    let description = `Hello there! It seems like ${petName} is ready for a meal or a drink. What would you like to give them? 
    \nProviding a balanced diet of food and water will keep ${petName} happy and healthy.
    \nChoose an option below to feed or hydrate your adorable companion! 🍲💧`;

    if (timeSinceLastFed < timeStamp.tenMinutes() && lastFedTimes.length >= 3) {
      const timeRemaining = Math.ceil(
        (timeStamp.tenMinutes() - timeSinceLastFed) / 60000
      );
      if (userDb.thirst < 20) {
        description = `${petName} is still trying to digest from the last feed and isn't thirsty either. Try again in ${timeRemaining} minutes.`;
      } else {
        description = `${petName} is still trying to digest from the last feed. Try again in ${timeRemaining} minutes. They might want some water though! 💧`;
      }
    } else if (userDb.hunger < 20 && userDb.thirst >= 20) {
      description = `${petName} isn't ready to eat, but they are thirsty.`;
    } else if (userDb.thirst < 20 && userDb.hunger >= 20) {
      description = `${petName} isn't thirsty, but they are ready to eat.`;
    } else if (userDb.hunger < 20 && userDb.thirst < 20) {
      description = `${petName} isn't hungry or thirsty right now.`;
    }

    // Check if pet is sick and if feeding fails
    if (userDb.isSick) {
      const randomChance = Math.random();
      if (randomChance < 0.6) {
        const feedFailEmbed = new EmbedBuilder()
          .setColor("#9e38fe")
          .setTitle("Oh no!")
          .setDescription(
            `${petName} isn't feeling well, they don't want to eat or drink right now.`
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [feedFailEmbed],
        });
        return;
      }
    }

    const feedFoodButton = new ButtonBuilder()
      .setCustomId("feedFood")
      .setLabel("Give Food")
      .setStyle("Primary")
      .setEmoji("🍽️")
      .setDisabled(
        userDb.hunger < 20 ||
          (timeSinceLastFed < timeStamp.tenMinutes() &&
            lastFedTimes.length >= 3)
      ); // disable the button based on these conditions

    const feedWaterButton = new ButtonBuilder()
      .setCustomId("feedWater")
      .setLabel("Give Water")
      .setStyle("Primary")
      .setEmoji("💧")
      .setDisabled(
        userDb.thirst < 20 ||
          (timeSinceLastDrank < timeStamp.tenMinutes() &&
            lastDrankTimes.length >= 3)
      );

    const actionRow = new ActionRowBuilder().addComponents(
      feedFoodButton,
      feedWaterButton
    );

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Feed ${petName}`)
      .setDescription(description);

    // Reply with the embed and buttons
    await interaction.reply({
      embeds: [embed],
      components: [actionRow],
    });
  },
};
