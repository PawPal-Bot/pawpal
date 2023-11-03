const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamps = require("../util/timeStamp");
const variables = require("../data/variableNames");

module.exports = {
  data: {
    name: "feedFood",
    description: "Give your pet a delicious treat!",
  },
  async execute(interaction, client) {
    await interaction.deferUpdate();

    const userId = interaction.user.id;
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
    const randomPetSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];
    const randomEatingSound =
      speechBubbles.eatingSounds[
        Math.floor(Math.random() * speechBubbles.eatingSounds.length)
      ];

    if (userDb.isSick) {
      const randomChance = Math.random();
      if (randomChance < 0.6) {
        const feedFailEmbed = new EmbedBuilder()
          .setColor("#9e38fe")
          .setTitle("Uh-oh!")
          .setDescription(
            `${petName} isn't feeling well right now and doesn't want to eat. Let's try again later.`
          )
          .setTimestamp();

        const feedAgainButton = new ButtonBuilder()
          .setCustomId("feedFood")
          .setLabel("Feed Again")
          .setStyle("Primary")
          .setDisabled(true);

        await interaction.editReply({
          embeds: [feedFailEmbed],
          components: [new ActionRowBuilder().addComponents(feedAgainButton)],
        });

        userDb.actionTimestamps.lastFed.push(new Date(Date.now() + 3600000));
        await userDb.save();

        return;
      }
    }

    if (userDb.hunger >= 100) {
      const fullEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oh no!")
        .setDescription(
          `${randomPetSound}! ${petName} is full and cannot eat any more!`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [fullEmbed],
        components: [],
      });
      return;
    }

    const lastThreeFed = userDb.actionTimestamps.lastFed.slice(-3);
    let canFeed = userDb.hunger < 100;

    if (lastThreeFed.length === 3) {
      const tenMinutesAgo = now.getTime() - timeStamps.tenMinutes();
      const feedTimesWithinTenMinutes = lastThreeFed.filter(
        (time) => new Date(time).getTime() > tenMinutesAgo
      ).length;

      if (feedTimesWithinTenMinutes === 3) {
        canFeed = false;
      } else if (feedTimesWithinTenMinutes === 2) {
        const thirdTime = new Date(lastThreeFed[0]).getTime();
        if (thirdTime < tenMinutesAgo) {
          canFeed = true;
        } else {
          canFeed = false;
        }
      }
    }

    if (!canFeed) {
      const tooMuchFoodEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oops!")
        .setDescription(
          `${randomPetSound}! ${petName} has eaten quite a bit recently and isn't hungry right now. Let's try again later.`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchFoodEmbed],
        components: [],
      });
      return;
    }

    // Push the current timestamp to the lastFed array
    userDb.actionTimestamps.lastFed.push(now);
    // Keep only the last 3 timestamps
    if (userDb.actionTimestamps.lastFed.length > 3) {
      userDb.actionTimestamps.lastFed.shift();
    }

    // Calculate the new hunger level
    const hungerIncrease = Math.floor(Math.random() * 15) + 1;
    const newHungerLevel = Math.min(userDb.hunger + hungerIncrease, 100);

    // Set the new hunger level
    userDb.hunger = newHungerLevel;

    // Increase the feed count
    userDb.feedCount += 1;

    // Update the database
    await userModel.updateOne(
      { userId: interaction.user.id },
      {
        $set: {
          actionTimestamps: userDb.actionTimestamps,
          hunger: userDb.hunger,
          feedCount: userDb.feedCount,
        },
      }
    );

    const updatedFeedEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle(`You treated ${petName} to a delicious snack!`)
      .setDescription(
        `${randomEatingSound}! ${petName} eagerly devours the tasty treat, and their hunger level is now ${variables.getHunger(
          userDb.hunger
        )}.`
      )
      .setFooter({
        text: `${variables.getHunger(userDb.hunger)}`,
      })
      .setTimestamp();

    const feedAgainButton = new ButtonBuilder()
      .setCustomId("feedFood")
      .setLabel("Feed Again")
      .setStyle("Primary")
      .setDisabled(!canFeed);

    await interaction.editReply({
      embeds: [updatedFeedEmbed],
      components: [new ActionRowBuilder().addComponents(feedAgainButton)],
    });
  },
};
