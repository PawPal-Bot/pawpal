const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const petProfile = require("../../schemas/PetModel");
const speechBubbles = require("../../data/speechBubbles.json");
const timeStamp = require("../../utils/timeStamp");
const variables = require("../../data/variableNames");

module.exports = {
  customId: "feedWater",
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
      await interaction.followUp({ content: "You don't have a pet to feed!", ephemeral: true });
      return;
    }

    // Ensure actionTimeStamp and its properties are initialized
    petDb.actionTimeStamp = petDb.actionTimeStamp || {};
    petDb.actionTimeStamp.lastDrank = petDb.actionTimeStamp.lastDrank || [];

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

    const randomDrinkingSound = speechBubbles.drinkingSounds[Math.floor(Math.random() * speechBubbles.drinkingSounds.length)];

    const randomPetSound = speechBubbles[petTypeStr][Math.floor(Math.random() * speechBubbles[petTypeStr].length)];

    let canDrink = petDb.thirst < 100;

    // Filter out the drink timestamps that are within the last 10 minutes
    const recentDrinks = petDb.actionTimeStamp.lastDrank.filter(time => new Date(time).getTime() > timeStamp.tenMinutesAgo());

    // If there are 3 or more recent drink times, the pet cannot drink more
    if (recentDrinks.length >= 3) {
      canDrink = false;
    }

    // If the pet cannot drink, send a message and return
    if (!canDrink || petDb.thirst >= 100) {
      const tooMuchDrinkEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Oh no!")
        .setDescription(`${randomPetSound}! ${petName} has had enough to drink recently. Try again later.`)
        .setTimestamp();

      await interaction.editReply({
        embeds: [tooMuchDrinkEmbed],
        components: [],
      });
      return;
    }

    // Ensure thirst is initialized before using it
    petDb.thirst = petDb.thirst ?? 0;

    // Add the current timestamp to the last drank array
    petDb.actionTimeStamp.lastDrank.push(timeStamp.now());
    while (petDb.actionTimeStamp.lastDrank.length > 3) {
      petDb.actionTimeStamp.lastDrank.shift();
    }

    // Increase thirst by a random amount
    const increaseThirstBy = Math.floor(Math.random() * 15) + 3;
    petDb.thirst = Math.min(petDb.thirst + increaseThirstBy, 100);
    const energyIncrease = Math.floor(0.3 * increaseThirstBy);
    petDb.energy = Math.min(petDb.energy + energyIncrease, 100);
    const increaseHappinessBy = Math.floor(Math.random() * 15) + 1;
    petDb.happiness = Math.min(petDb.happiness + increaseHappinessBy, 100);

    petDb.drinkCount += 1;

    // Update the user in the database
    await petProfile.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        $set: {
          "actionTimeStamp.lastDrank": petDb.actionTimeStamp.lastDrank,
          thirst: petDb.thirst,
          energy: petDb.energy,
          happiness: petDb.happiness,
          drinkCount: petDb.drinkCount,
        },
      }
    );

    // Create the embed for a successful drink
    const updatedWaterEmbed = new EmbedBuilder()
      .setColor("#3399ff")
      .setTitle(`You gave ${petName} some water!`)
      .setDescription(`${randomPetSound}! ${petName} ${randomDrinkingSound}s the water happily! Their thirst level is now ${variables.getThirst(petDb.thirst)}.`)
      .addFields(
        { name: "Hydration Level", value: `+${increaseThirstBy}`, inline: true },
        { name: "Happiness", value: `+${increaseHappinessBy}`, inline: true },
        { name: "Energy", value: `+${energyIncrease}`, inline: true }
      )
      .setFooter({ text: `Hunger Level: ${variables.getHunger(petDb.hunger)}` })
      .setFooter({
        text: `Thirst Level: ${variables.getThirst(petDb.thirst)}`,
      })
      .setTimestamp();

    // Create the button for giving more water
    const waterAgainButton = new ButtonBuilder().setCustomId("feedWater").setLabel("Give More Water").setStyle("Primary").setDisabled(!canDrink);

    // Send the reply with the embed and the button
    await interaction.editReply({
      embeds: [updatedWaterEmbed],
      components: [new ActionRowBuilder().addComponents(waterAgainButton)],
    });
  },
};
