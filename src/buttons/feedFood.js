const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamps = require("../util/timeStamp");

module.exports = {
  data: {
    name: "feedFood",
    description: "Give your adorable pet a delicious treat!",
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

    // Check if the pet can be fed
    const oldestFedTime = new Date(
      userDb.actionTimestamps.lastFed[0]
    ).getTime();
    const timeSinceOldestFed = now - oldestFedTime;
    const canFeed =
      timeSinceOldestFed >= timeStamps.tenMinutes() ||
      userDb.actionTimestamps.lastFed.length < 3;

    // Check if hunger is less than 100
    if (userDb.hunger >= 100) {
      const tooMuchFoodEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oops!")
        .setDescription(
          `${petName} has eaten quite a bit recently and isn't hungry right now. Let's try again later.`
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchFoodEmbed],
        components: [],
      });
      return;
    }

    userDb.actionTimestamps.lastFed.push(now);
    if (userDb.actionTimestamps.lastFed.length > 3) {
      userDb.actionTimestamps.lastFed.shift();
    }
    userDb.hunger = Math.min(
      userDb.hunger + Math.floor(Math.random() * 15) + 1,
      100
    );
    userDb.feedCount += 1;

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
        `${randomPetSound}! ${petName} eagerly devours the tasty treat, and their hunger level is now ${userDb.hunger}.`
      )
      .setFooter({
        text: `Hunger Level: ${userDb.hunger}/100`,
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
