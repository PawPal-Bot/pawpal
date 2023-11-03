const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const userProfileModel = require("../util/Models/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetprofile")
    .setDescription(
      "Resets your profile to default values, preserving petName, petType, hasPet, and petId"
    ),

  async execute(interaction) {
    const userId = interaction.user.id;

    const userDb = await userProfileModel.findOne({ userId });
    if (!userDb) {
      await interaction.reply(
        "Your profile does not exist or has already been reset."
      );
      return;
    }

    // Reset the profile
    await userProfileModel.updateOne(
      { userId },
      {
        $set: {
          lifeStage: 0,
          age: 0,
          health: 100,
          isSick: false,
          medicineCount: 0,
          discipline: 0,
          trainingLevel: 0,
          happiness: 50,
          energy: 100,
          hunger: 50,
          thirst: 50,
          cleanliness: 50,
          exerciseLevel: 0,
          sleepLevel: 100,
          educationLevel: 0,
          affection: 50,
          miniGameScores: {},
          patCount: 0,
          cuddleCount: 0,
          feedCount: 0,
          drinkCount: 0,
          cleanedCount: 0,
          socialisation: {
            friends: [],
            competitionsEntered: 0,
          },
          accessories: [],
          housingCustomisations: [],
          actionTimeStamp: {
            lastFed: [],
            lastDrank: [],
            lastCleaned: [],
            lastGroomed: [],
            lastMedicine: [],
            lastPlayed: [],
            lastEducated: [],
            lastRan: [],
            lastWalked: [],
            lastPat: [],
            lastCuddled: [],
          },
        },
      }
    );

    const resetEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Profile Reset")
      .setDescription(
        "Your profile has been successfully reset to default values, preserving your pet details."
      )
      .setTimestamp();

    await interaction.reply({ embeds: [resetEmbed] });
  },
};
