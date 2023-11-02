const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamps = require("../util/timeStamp");

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

    const oldestDrankTime = new Date(
      userDb.actionTimestamps.lastDrank[0]
    ).getTime();
    const timeSinceOldestDrank = now - oldestDrankTime;
    const canDrink =
      timeSinceOldestDrank >= timeStamps.tenMinutes() ||
      userDb.actionTimestamps.lastDrank.length < 3;

    if (userDb.thirst >= 100) {
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

    if (!canDrink) {
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
    if (userDb.actionTimestamps.lastDrank.length > 5) {
      userDb.actionTimestamps.lastDrank.shift();
    }

    const increaseThirstBy = Math.floor(Math.random() * 15) + 1;
    userDb.thirst = Math.min(userDb.thirst + increaseThirstBy, 100);

    userDb.drinkCount += 1;

    await userModel.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        $set: {
          actionTimestamps: userDb.actionTimestamps,
          thirst: userDb.thirst,
          drinkCount: userDb.drinkCount,
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
      .setDisabled(!canDrink);

    await interaction.editReply({
      embeds: [updatedWaterEmbed],
      components: [new ActionRowBuilder().addComponents(waterAgainButton)],
    });
  },
};
