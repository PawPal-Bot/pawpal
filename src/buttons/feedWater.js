const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: {
    name: "feedWater",
    description: "Button to give your pet water",
  },
  async execute(interaction, client, userDb) {
    await interaction.deferUpdate();
    const petName = userDb.petName ? userDb.petName : "Your pet";
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
    const randomPetSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];
    const randomDrinkingSound =
      speechBubbles.drinkingSounds[
        Math.floor(Math.random() * speechBubbles.drinkingSounds.length)
      ];

    const recentDrinks = (userDb.actionTimestamps.lastDrank || []).filter(
      (drinkTime) => drinkTime >= tenMinutesAgo
    );

    if (recentDrinks.length >= 3) {
      const tooMuchDrinkEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oh no!")
        .setDescription(
          `${randomPetSound}! ${petName} has had enough to drink recently. Try again later.`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchDrinkEmbed],
        components: [],
      });
      return;
    }

    userDb.actionTimestamps.lastDrank.push(now);
    userDb.thirst = Math.min(
      userDb.thirst + Math.floor(Math.random() * 15) + 1,
      100
    );
    await userModel.updateOne(
      { userId: interaction.user.id },
      {
        $set: {
          actionTimestamps: userDb.actionTimestamps,
          thirst: userDb.thirst,
        },
      }
    );

    const updatedWaterEmbed = new EmbedBuilder()
      .setColor("#3399ff")
      .setTitle(`You gave ${petName} some water!`)
      .setDescription(
        `${randomPetSound}! ${petName} ${randomDrinkingSound}s the water happily! Their thirst level is now ${userDb.thirst}.`
      )

      .setFooter({
        text: `Thirst Level: ${userDb.thirst}/100`,
      })
      .setTimestamp();

    const waterAgainButton = new ButtonBuilder()
      .setCustomId("feedWater")
      .setLabel("Give More Water")
      .setStyle("Primary")
      .setDisabled(userDb.drinkTimestamps.length >= 3);

    await interaction.editReply({
      embeds: [updatedWaterEmbed],
      components: [new ActionRowBuilder().addComponents(waterAgainButton)],
    });
  },
};
