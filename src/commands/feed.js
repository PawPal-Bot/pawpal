const {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
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

    const oldestFedTime =
      lastFedTimes.length > 0 ? new Date(lastFedTimes[0]).getTime() : 0;
    const oldestDrankTime =
      lastDrankTimes.length > 0 ? new Date(lastDrankTimes[0]).getTime() : 0;

    const timeUntilNextAllowedFeed = Math.max(
      0,
      Math.ceil((oldestFedTime + timeStamp.tenMinutes() - Date.now()) / 60000)
    );
    const timeUntilNextAllowedDrink = Math.max(
      0,
      Math.ceil((oldestDrankTime + timeStamp.tenMinutes() - Date.now()) / 60000)
    );

    const canFeedFood =
      userDb.hunger <= 100 &&
      (timeUntilNextAllowedFeed <= 0 || lastFedTimes.length < 3);
    const canFeedWater =
      userDb.thirst <= 100 &&
      (timeUntilNextAllowedDrink <= 0 || lastDrankTimes.length < 3);

    let description = `Hello there! It seems like ${petName} is ready for a meal or a drink. What would you like to give them? 
    \nProviding a balanced diet of food and water will keep ${petName} happy and healthy.
    \nChoose an option below to feed or hydrate your adorable companion! 🍲💧`;

    if (canFeedFood && canFeedWater) {
      description = `Hello there! It seems like ${petName} is ready for a meal or a drink. What would you like to give them? 
        \nProviding a balanced diet of food and water will keep ${petName} happy and healthy.
        \nChoose an option below to feed or hydrate your adorable companion! 🍲💧`;
    } else if (canFeedFood && !canFeedWater) {
      description = `${petName} is ready to eat, but they are not thirsty. They can drink again in ${timeUntilNextAllowedDrink} minutes.`;
    } else if (!canFeedFood && canFeedWater) {
      description = `${petName} is thirsty, but they are not ready to eat. They can eat again in ${timeUntilNextAllowedFeed} minutes.`;
    } else if (!canFeedFood && !canFeedWater) {
      description = `${petName} isn't hungry or thirsty right now. They can eat again in ${timeUntilNextAllowedFeed} minutes, and drink again in ${timeUntilNextAllowedDrink} minutes.`;
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
      .setDisabled(!canFeedFood);

    const feedWaterButton = new ButtonBuilder()
      .setCustomId("feedWater")
      .setLabel("Give Water")
      .setStyle("Primary")
      .setEmoji("💧")
      .setDisabled(!canFeedWater);

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
