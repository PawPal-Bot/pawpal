const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const petProfile = require("../../schemas/PetModel");
const speechBubbles = require("../../data/speechBubbles.json");
const timeStamp = require("../../utils/timeStamp");
const variables = require("../../data/variableNames");

module.exports = {
  customId: "pat",
  public: false,
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferUpdate();

    const petDb = await petProfile.findOne({ userId: interaction.user.id });
    if (!petDb || petDb.petType === 0) {
      await interaction.followUp("You don't have a pet to pat!");
      return;
    }

    const petName = petDb.petName ? petDb.petName : "your pet";

    if (petDb.happiness >= 100) {
      const maxHappinessEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle(`${petName} is already ecstatic!`)
        .setDescription(`${petName} can't get any happier right now.`)
        .setFooter({
          text: `Happiness: ${variables.getHappiness(petDb.happiness)}`,
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [maxHappinessEmbed],
        components: [],
      });
      return;
    }

    if (!petDb.actionTimeStamp.lastPat || !Array.isArray(petDb.actionTimeStamp.lastPat)) {
      petDb.actionTimeStamp.lastPat = [];
    }

    const now = new Date();
    const tenMinutesAgo = timeStamp.tenMinutesAgo();

    petDb.actionTimeStamp.lastPat = petDb.actionTimeStamp.lastPat.filter(patTime => new Date(patTime) >= tenMinutesAgo);

    if (petDb.actionTimeStamp.lastPat.length >= 3) {
      const tooManyPatsEmbed = new EmbedBuilder().setColor("#FF0000").setTitle("Too Many Pats").setDescription(`${petName} has been patted too much recently. Try again later.`).setTimestamp();

      await interaction.editReply({
        embeds: [tooManyPatsEmbed],
        components: [],
      });
      return;
    }

    petDb.actionTimeStamp.lastPat.push(now);
    petDb.actionTimeStamp.lastPat = petDb.actionTimeStamp.lastPat.slice(-5);

    if (petDb.energy < 5) {
      const lowEnergyEmbed = new EmbedBuilder().setColor("#FF0000").setTitle("Low Energy").setDescription(`${petName} is too tired for pats right now.`).setTimestamp();

      await interaction.editReply({
        embeds: [lowEnergyEmbed],
        components: [],
      });
      return;
    }

    petDb.patCount += 1;

    const happinessIncrease = Math.floor(Math.random() * 25) + 1;
    petDb.happiness = Math.min(petDb.happiness + happinessIncrease, 100);

    const affectionIncrease = Math.floor(Math.random() * 25) + 1;
    petDb.affection = Math.min(petDb.affection + affectionIncrease, 100);

    const energyIncrease = Math.floor(Math.random() * 25) + 1;
    petDb.energy = Math.min(petDb.energy + energyIncrease, 100);

    await petDb.save();

    const petTypeStr = ["none", "dog", "cat", "redPanda"][petDb.petType];
    const randomPetSound = speechBubbles[petTypeStr][Math.floor(Math.random() * speechBubbles[petTypeStr].length)];

    const patEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle("Pat your pet!")
      .setDescription(`${randomPetSound}! ${petName} loves the attention.`)
      .addFields(
        { name: "Happiness", value: `+${happinessIncrease}`, inline: true },
        { name: "Affection", value: `+${affectionIncrease}`, inline: true },
        { name: "Energy", value: `+${energyIncrease}`, inline: true }
      )
      .setFooter({
        text: `Happiness: ${variables.getHappiness(petDb.happiness)}`,
      })
      .setTimestamp();

    const patAgainButton = new ButtonBuilder().setCustomId("pat").setLabel("Pat Again").setStyle("Primary");

    await interaction.editReply({
      embeds: [patEmbed],
      components: [new ActionRowBuilder().addComponents(patAgainButton)],
    });
  },
};
