const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: {
    name: "pat",
    description: "Button for patting the pet",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();

    const userDb = await userModel.findOne({ userId: interaction.user.id });

    if (!userDb || userDb.petType === 0) {
      await interaction.followUp("You don't have a pet to pat!");
      return;
    }

    const petName = userDb.petName ? userDb.petName : "your pet";

    if (userDb.happiness >= 100) {
      const maxHappinessEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle(`${petName} is already ecstatic!`)
        .setDescription(`${petName} can't get any happier right now.`)
        .setFooter({ text: `Happiness: ${userDb.happiness}/100` })
        .setTimestamp();

      await interaction.editReply({
        embeds: [maxHappinessEmbed],
        components: [],
      });
      return;
    }

    if (
      !userDb.actionTimestamps.lastPat ||
      !Array.isArray(userDb.actionTimestamps.lastPat)
    ) {
      userDb.actionTimestamps.lastPat = [];
    }
    userDb.actionTimestamps.lastPat.push(new Date());
    userDb.actionTimestamps.lastPat = userDb.actionTimestamps.lastPat.slice(-5);

    userDb.patCount += 1;

    const baseHappinessIncrease = 2;
    const happinessIncrease = Math.floor(Math.random() * 25) + 1;

    userDb.happiness = Math.min(userDb.happiness + happinessIncrease, 100);

    const affectionIncrease = Math.random() * 0.5 + 0.2;
    userDb.affection = Math.min(userDb.affection + affectionIncrease, 100);

    const energyDecrease = Math.floor(Math.random() * 7) + 1;
    userDb.energy = Math.max(userDb.energy - energyDecrease, 0);

    await userDb.save();

    const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
    const randomSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];

    const recentPats = (userDb.actionTimestamps.lastPat || []).filter(
      (patTime) => patTime >= timeStamp.tenMinutesAgo
    );

    if (userDb.energy < 5) {
      const lowEnergyEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Low Energy")
        .setDescription(`${petName} is too tired for pats right now.`)
        .setTimestamp();

      await interaction.editReply({
        embeds: [lowEnergyEmbed],
        components: [],
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
        components: [],
      });
      return;
    }

    const patEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle(`You patted ${petName}!`)
      .setDescription(
        `${randomSound}! ${petName} looks ${
          happinessIncrease < baseHappinessIncrease ? "a little " : ""
        }happier now!`
      )
      .setFooter({ text: `Happiness: ${userDb.happiness}/100` })
      .setTimestamp();

    const patAgainButton = new ButtonBuilder()
      .setCustomId("pat")
      .setLabel("Pat Again")
      .setStyle("Primary");

    await interaction.editReply({
      embeds: [patEmbed],
      components: [new ActionRowBuilder().addComponents(patAgainButton)],
    });
  },
};
