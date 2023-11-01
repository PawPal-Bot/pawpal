const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: {
    name: "feedFood",
    description: "Button to feed your pet food",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();

    const userId = interaction.user.id;

    // Fetch the latest user data from the database
    const userDb = await userModel.findOne({ userId });
    if (!userDb) {
      console.error("User not found:", userId);
      // Handle error, perhaps by returning early
      return;
    }

    const petName = userDb.petName ? userDb.petName : "Your pet";
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const petTypeStrMap = {
      1: "dog",
      2: "cat",
      3: "redPanda",
    };

    const petTypeStr = petTypeStrMap[userDb.petType];
    if (!petTypeStr) {
      console.error("Invalid pet type:", userDb.petType);
      // Handle error, perhaps by returning early
      return;
    }
    const randomPetSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];
    const randomEatingSound =
      speechBubbles.eatingSounds[
        Math.floor(Math.random() * speechBubbles.eatingSounds.length)
      ];

    if (userDb.actionTimestamps.lastFed.length >= 3) {
      const tooMuchFoodEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oh no!")
        .setDescription(
          `${randomPetSound}! ${petName} has had enough to eat recently. Try again later.`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchFoodEmbed],
        components: [],
      });
      return;
    }

    userDb.actionTimestamps.lastFed.push(now);
    userDb.hunger = Math.min(
      userDb.hunger + Math.floor(Math.random() * 15) + 1,
      100
    );
    await userModel.updateOne(
      { userId: interaction.user.id },
      {
        $set: {
          actionTimestamps: userDb.actionTimestamps,
          hunger: userDb.hunger,
        },
      }
    );

    const updatedFeedEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle(`You fed ${petName} a treat again!`)
      .setDescription(
        `${randomPetSound}! ${petName} ${randomEatingSound}s the treat happily! Their hunger level is now ${userDb.hunger}.`
      )
      .setFooter({
        text: `Hunger Level: ${userDb.hunger}/100`,
      })
      .setTimestamp();

    const feedAgainButton = new ButtonBuilder()
      .setCustomId("feedFood")
      .setLabel("Give More Food")
      .setStyle("Primary")
      .setDisabled(userDb.actionTimestamps.lastFed.length >= 4);

    await interaction.editReply({
      embeds: [updatedFeedEmbed],
      components: [new ActionRowBuilder().addComponents(feedAgainButton)],
    });
  },
};