const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: {
    name: "patAgain",
    description: "Button for patting the pet again",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();
    let userDb = await userModel.findOne({ userId: interaction.user.id });

    const petName = userDb.petName ? userDb.petName : "your pet";

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentPats = userDb.patTimestamps.filter(
      (timestamp) => timestamp > tenMinutesAgo
    );

    if (recentPats.length >= 5) {
      const earliestPatTimestamp = recentPats[0];
      const timeRemainingMs =
        new Date(earliestPatTimestamp).getTime() + 10 * 60 * 1000 - Date.now();
      const minutesRemaining = Math.ceil(timeRemainingMs / (60 * 1000));

      const tooMuchPatEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Too Many Pats!")
        .setDescription(
          `You've patted ${petName} a little too much. Please wait ${minutesRemaining} minute(s) before patting again.`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchPatEmbed],
        components: [],
      });
      return;
    }

    userDb.patTimestamps.push(new Date());
    userDb.patTimestamps = userDb.patTimestamps.slice(-5);
    userDb.patCount += 1;

    const baseHappinessIncrease = 5;
    const happinessIncrease = Math.floor(Math.random() * 25) + 1;

    userDb.petHappiness = Math.min(
      userDb.petHappiness + happinessIncrease,
      100
    );
    await userDb.save();

    const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
    const randomSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];

    if (userDb.petHappiness === 100) {
      await interaction.editReply({
        content: `${randomSound}! ${petName} can't get any happier!`,
        embeds: [],
        components: [],
      });
      return;
    }

    const updatedPatEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle("You patted your pet again!")
      .setDescription(
        `${randomSound}! ${petName} looks ${
          happinessIncrease < baseHappinessIncrease ? "a little " : ""
        }happier now!`
      )
      .setFooter({ text: `Happiness: ${userDb.petHappiness}/100` })
      .setTimestamp();

    const patAgainButton = new ButtonBuilder()
      .setCustomId("patAgain")
      .setLabel("Pat Again")
      .setStyle("Primary");

    await interaction.editReply({
      embeds: [updatedPatEmbed],
      components: [new ActionRowBuilder().addComponents(patAgainButton)],
    });
  },
};
