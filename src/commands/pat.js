const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Pat your pet!"),

  async execute(interaction, client) {
    await interaction.deferReply();

    const userDb = await userModel.findOne({ userId: interaction.user.id });

    if (!userDb || userDb.petType === 0) {
      await interaction.editReply("You don't have a pet to pat!");
      return;
    }

    if (userDb.happiness >= 100) {
      // Changed userDb.petHappiness to userDb.happiness
      await interaction.editReply("Your pet can't get any happier!");
      return;
    }

    const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
    const randomSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];

    // Checking and initializing actionTimestamps.lastPatted if necessary
    if (
      !userDb.actionTimestamps.lastPat ||
      !Array.isArray(userDb.actionTimestamps.lastPat)
    ) {
      userDb.actionTimestamps.lastPat = [];
    }
    userDb.actionTimestamps.lastPat.push(new Date());
    userDb.actionTimestamps.lastPat = userDb.actionTimestamps.lastPat.slice(-5);

    userDb.patCount += 1;

    const baseHappinessIncrease = 5;
    const happinessIncrease = Math.floor(Math.random() * 25) + 1;

    userDb.happiness = Math.min(userDb.happiness + happinessIncrease, 100);

    // New code: Increase affection and decrease energy
    const affectionIncrease = Math.random() * 0.5 + 0.2; // Random value between 0.2 and 0.7
    userDb.affection = Math.min(userDb.affection + affectionIncrease, 100); // Ensure affection doesn't exceed 100

    const energyDecrease = Math.floor(Math.random() * 7) + 1; // Random integer between 1 and 7
    userDb.energy = Math.max(userDb.energy - energyDecrease, 0); // Ensure energy doesn't go below 0

    await userDb.save();

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const recentPats = (userDb.actionTimestamps.lastPat || []).filter(
      (patTime) => patTime >= tenMinutesAgo
    );

    if (userDb.energy < 5) {
      const lowEnergyEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Low Energy")
        .setDescription(`${petName} is too tired for pats right now.`)
        .setTimestamp();

      await interaction.editReply({
        embeds: [lowEnergyEmbed],
        components: [], // Remove any buttons
      });
      return;
    }

    if (recentPats.length >= 3) {
      const tooManyPatsEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Too Many Pats")
        .setDescription(
          `${petName} has been patted too much recently. Try again later.`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooManyPatsEmbed],
        components: [], // Remove any buttons
      });
      return;
    }

    const patEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle("Pat your pet!")
      .setDescription(`${randomSound}! Give your pet some love.`)
      .setFooter({ text: `Happiness: ${userDb.happiness}/100` }) // Changed userDb.petHappiness to userDb.happiness
      .setTimestamp();

    const patButton = new ButtonBuilder()
      .setCustomId("pat")
      .setLabel("Pat")
      .setStyle("Primary");

    await interaction.editReply({
      embeds: [patEmbed],
      components: [new ActionRowBuilder().addComponents(patButton)],
    });
  },
};
