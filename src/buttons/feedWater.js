const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: {
    name: "feedWater",
    description: "Button to give your pet water",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();

    const userId = interaction.user.id;

    // Fetch the latest user data from the database
    const userDb = await userModel.findOne({ userId });
    if (!userDb) {
      console.error("User not found:", userId);
      return;
    }

    const petName = userDb.petName ? userDb.petName : "Your pet";
    const now = new Date();

    const petTypeStrMap = {
      1: "dog",
      2: "cat",
      3: "redPanda",
    };

    const petTypeStr = petTypeStrMap[userDb.petType];
    if (!petTypeStr) {
      console.error("Invalid pet type:", userDb.petType);
      return;
    }
    const randomDrinkingSound =
      speechBubbles.drinkingSounds[
        Math.floor(Math.random() * speechBubbles.drinkingSounds.length)
      ];
    const randomPetSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];
    if (userDb.actionTimestamps.lastDrank.length >= 3) {
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
    await userModel.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        $set: {
          actionTimestamps: userDb.actionTimestamps,
          thirst: userDb.thirst,
          drinkCount: userDb.drinkCount + 1,
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
      .setDisabled(userDb.actionTimestamps.lastDrank.length >= 4);

    await interaction.editReply({
      embeds: [updatedWaterEmbed],
      components: [new ActionRowBuilder().addComponents(waterAgainButton)],
    });
  },
};
