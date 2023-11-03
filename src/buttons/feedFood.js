const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamp = require("../util/timeStamp");
const variables = require("../data/variableNames");

module.exports = {
  data: {
    name: "feedFood",
    description: "Button to give your pet some food",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();

    const userId = interaction.user.id;
    const userDb = await userModel.findOne({ userId });
    if (!userDb) {
      console.error("User not found:", userId);
      return;
    }

    // Ensure actionTimeStamp and its properties are initialized
    userDb.actionTimeStamp = userDb.actionTimeStamp || {};
    userDb.actionTimeStamp.lastFed = userDb.actionTimeStamp.lastFed || [];

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

    const randomEatingSound =
      speechBubbles.eatingSounds[
        Math.floor(Math.random() * speechBubbles.eatingSounds.length)
      ];

    const randomPetSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];

    let canEat = userDb.hunger < 100;

    const tenMinutesAgo = timeStamp.tenMinutesAgo();

    // Filter out the feed timestamps that are within the last 10 minutes
    const recentFeeds = userDb.actionTimeStamp.lastFed.filter(
      (time) => new Date(time).getTime() > tenMinutesAgo
    );

    // If there are 3 or more recent feed times, the pet cannot eat more
    if (recentFeeds.length >= 3) {
      canEat = false;
    }

    // If the pet cannot eat, send a message and return
    if (!canEat || userDb.hunger >= 100) {
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

    // Ensure hunger is initialized before using it
    userDb.hunger = userDb.hunger ?? 0;

    // Add the current timestamp to the last fed array
    userDb.actionTimeStamp.lastFed.push(now);
    // Keep only the last 3 timestamps
    while (userDb.actionTimeStamp.lastFed.length > 3) {
      userDb.actionTimeStamp.lastFed.shift();
    }

    // Increase hunger by a random amount
    const increaseHungerBy = Math.floor(Math.random() * 15) + 1;
    userDb.hunger = Math.min(userDb.hunger + increaseHungerBy, 100);
    const energyIncrease = Math.floor(0.3 * increaseHungerBy);
    userDb.energy = Math.min(userDb.energy + energyIncrease, 100);

    // Increment the feed count
    userDb.feedCount += 1;

    // Update the user in the database
    await userModel.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        $set: {
          "actionTimeStamp.lastFed": userDb.actionTimeStamp.lastFed,
          hunger: userDb.hunger,
          energy: userDb.energy,
          feedCount: userDb.feedCount,
        },
      }
    );

    // Create the embed for a successful feed
    const updatedFoodEmbed = new EmbedBuilder()
      .setColor("#3399ff")
      .setTitle(`You gave ${petName} some food!`)
      .setDescription(
        `${randomPetSound}! ${petName} ${randomEatingSound}s the food happily! Their hunger level is now ${variables.getHunger(
          userDb.hunger
        )}.`
      )
      .setFooter({
        text: `Hunger Level: ${variables.getHunger(userDb.hunger)}`,
      })
      .setTimestamp();

    // Create the button for giving more food
    const feedAgainButton = new ButtonBuilder()
      .setCustomId("feedFood")
      .setLabel("Give More Food")
      .setStyle("Primary")
      .setDisabled(!canEat);

    // Send the reply with the embed and the button
    await interaction.editReply({
      embeds: [updatedFoodEmbed],
      components: [new ActionRowBuilder().addComponents(feedAgainButton)],
    });
  },
};
