const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: {
    name: "feedAgain",
    description: "Button for feeding the pet again",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();
    let userDb = await userModel.findOne({ userId: interaction.user.id });

    const petName = userDb.petName ? userDb.petName : "Your pet";

    if (userDb.feedTimestamps.length >= 3) {
      const tooFullEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oh no!")
        .setDescription(
          `${petName} is too full to eat that right now, try again in a little bit`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooFullEmbed],
        components: [],
      });
      return;
    }

    userDb.feedTimestamps.push(new Date());
    userDb.feedTimestamps = userDb.feedTimestamps.slice(-3);
    userDb.feedCount += 1;
    await userDb.save();

    const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
    const randomPetSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];
    const randomEatingSound =
      speechBubbles.eatingSounds[
        Math.floor(Math.random() * speechBubbles.eatingSounds.length)
      ];

    const updatedFeedEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle(`You fed ${petName} a treat again!`)
      .setDescription(
        `${randomPetSound}! ${petName} ${randomEatingSound}s the treat happily!`
      )
      .setTimestamp();

    const feedAgainButton = new ButtonBuilder()
      .setCustomId("feedAgain")
      .setLabel("Feed Again")
      .setStyle("Primary");

    await interaction.editReply({
      embeds: [updatedFeedEmbed],
      components: [new ActionRowBuilder().addComponents(feedAgainButton)],
    });
  },
};
