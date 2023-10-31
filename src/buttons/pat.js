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

    const petName = userDb.petName ? userDb.petName : "your pet";

    if (!userDb || userDb.petType === 0) {
      await interaction.followUp("You don't have a pet to pat!");
      return;
    }

    if (userDb.petHappiness >= 100) {
      await interaction.followUp(`${petName} can't get any happier!`);
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

    const patEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle(`You patted ${petName}!`)
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
      embeds: [patEmbed],
      components: [new ActionRowBuilder().addComponents(patAgainButton)],
    });
  },
};
