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

    const now = new Date();
    const tenMinutesAgo = now.getTime() - timeStamp.tenMinutes();

    // Check if the pet can be fed based on timestamps and hunger level
    const recentFedTimes = lastFedTimes.filter(
      (time) => new Date(time).getTime() > tenMinutesAgo
    );
    const canFeedFood =
      userDb.hunger < 100 &&
      (recentFedTimes.length < 3 ||
        (recentFedTimes.length === 3 &&
          new Date(lastFedTimes[2]).getTime() <= tenMinutesAgo));

    // Check if the pet can be given water based on timestamps and thirst level
    const recentDrankTimes = lastDrankTimes.filter(
      (time) => new Date(time).getTime() > tenMinutesAgo
    );
    const canFeedWater =
      userDb.thirst < 100 &&
      (recentDrankTimes.length < 3 ||
        (recentDrankTimes.length === 3 &&
          new Date(lastDrankTimes[2]).getTime() <= tenMinutesAgo));

    let baseDescription = `Hello there!`;

    if (canFeedFood && !canFeedWater) {
      baseDescription += ` It seems like ${petName} is hungry and ready to eat.`;
    } else if (!canFeedFood && canFeedWater) {
      baseDescription += ` It seems like ${petName} is thirsty and ready for a drink.`;
    } else if (canFeedFood && canFeedWater) {
      baseDescription += ` It seems like ${petName} is ready for both a meal and a drink.
  \nChoose an option below to feed or hydrate your adorable companion! 🍲💧`;
    } else {
      baseDescription += ` Unfortunately, ${petName} isn't hungry or thirsty right now.`;
    }

    let description = `${baseDescription}
\nProviding a balanced diet of food and water will keep ${petName} happy and healthy.`;

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
