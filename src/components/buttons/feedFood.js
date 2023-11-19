const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const petProfile = require("../../schemas/PetModel");
const speechBubbles = require("../../data/speechBubbles.json");
const timeStamp = require("../../utils/timeStamp");
const variables = require("../../data/variableNames");

module.exports = {
  customId: "feedFood",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferUpdate();

    const userId = interaction.user.id;
    const petDb = await petProfile.findOne({ userId });
    if (!petDb) {
      console.error("Pet not found:", userId);
      await interaction.followUp({content: "You don't have a pet to feed!", ephemeral: true});
      return;
    }

    // Ensure actionTimeStamp and its properties are initialized
    petDb.actionTimeStamp = petDb.actionTimeStamp || {};
    petDb.actionTimeStamp.lastFed = petDb.actionTimeStamp.lastFed || [];

    const petName = petDb.petName ? petDb.petName : "Your pet";

    const petTypeStrMap = {
      1: "dog",
      2: "cat",
      3: "redPanda",
    };

    const petTypeStr = petTypeStrMap[petDb.petType];
    if (!petTypeStr) {
      console.error("Invalid pet type:", petDb.petType);
      return;
    }

    const randomEatingSound = speechBubbles.eatingSounds[Math.floor(Math.random() * speechBubbles.eatingSounds.length)];

    const randomPetSound = speechBubbles[petTypeStr][Math.floor(Math.random() * speechBubbles[petTypeStr].length)];

    let canEat = petDb.hunger < 100;

    const tenMinutesAgo = timeStamp.tenMinutesAgo();

    // Filter out the feed timestamps that are within the last 10 minutes
    const recentFeeds = petDb.actionTimeStamp.lastFed.filter(time => new Date(time).getTime() > tenMinutesAgo);

    // If there are 3 or more recent feed times, the pet cannot eat more
    if (recentFeeds.length >= 3) {
      canEat = false;
    }

    // If the pet cannot eat, send a message and return
    if (!canEat || petDb.hunger >= 100) {
      const tooMuchFoodEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oh no!")
        .setDescription(`${randomPetSound}! ${petName} has had enough to eat recently. Try again later.`)
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchFoodEmbed],
        components: [],
      });
      return;
    }

    // Ensure hunger is initialized before using it
    petDb.hunger = petDb.hunger ?? 0;

    petDb.actionTimeStamp.lastFed.push(timeStamp.now());
    while (petDb.actionTimeStamp.lastFed.length > 3) {
      petDb.actionTimeStamp.lastFed.shift();
    }

    const increaseHungerBy = Math.floor(Math.random() * 15) + 3;
    petDb.hunger = Math.min(petDb.hunger + increaseHungerBy, 100);
    const energyIncrease = Math.floor(0.3 * increaseHungerBy);
    petDb.energy = Math.min(petDb.energy + energyIncrease, 100);
    const increaseHappinessBy = Math.floor(Math.random() * 15) + 1;
    petDb.happiness = Math.min(petDb.happiness + increaseHappinessBy, 100);

    petDb.feedCount += 1;

    await petProfile.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        $set: {
          "actionTimeStamp.lastFed": petDb.actionTimeStamp.lastFed,
          hunger: petDb.hunger,
          energy: petDb.energy,
          happiness: petDb.happiness,
          feedCount: petDb.feedCount,
        },
      }
    );

    const updatedFoodEmbed = new EmbedBuilder()
      .setColor("#3399ff")
      .setTitle(`You gave ${petName} some food!`)
      .setDescription(`${randomPetSound}! ${petName} ${randomEatingSound}s the food happily! Their hunger level is now ${variables.getHunger(petDb.hunger)}.`)
      .addFields(
        { name: "Hunger Sated", value: `+${increaseHungerBy}`, inline: true },
        { name: "Happiness", value: `+${increaseHappinessBy}`, inline: true },
        { name: "Energy", value: `+${energyIncrease}`, inline: true }
      )
      .setFooter({ text: `Hunger Level: ${variables.getHunger(petDb.hunger)}` })
      .setTimestamp();

    const feedAgainButton = new ButtonBuilder().setCustomId("feedFood").setLabel("Give More Food").setStyle("Primary").setDisabled(!canEat);

    await interaction.editReply({
      embeds: [updatedFoodEmbed],
      components: [new ActionRowBuilder().addComponents(feedAgainButton)],
    });
  },
};
