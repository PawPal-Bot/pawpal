const petProfile = require("../../schemas/PetModel");
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const variables = require("../../data/variableNames");

module.exports = {
  customId: "hideandseek",
  public: false,
  /**
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    // Check if interaction is defined
    if (!interaction) {
      console.error("Interaction is undefined or null");
      return;
    }

    const userId = interaction.user.id;
    const profile = await petProfile.findOne({ userId: userId });
    const miniGameState = profile.miniGames.hideAndSeek;

    const locationObject = miniGameState.buttonLocations.find(loc => loc.buttonId === interaction.customId);
    if (!locationObject) {
      return await interaction.reply({
        content: "This button is no longer active.",
        ephemeral: true,
      });
    }

    await handleGameLogic(interaction, miniGameState, locationObject, profile, userId);
  },
};

async function handleGameLogic(interaction, miniGameState, locationObject, profile, userId) {
  const isFound = Math.random() < 1 / (5 - miniGameState.attempts);
  miniGameState.attempts++;

  if (isFound) {
    const maxAttributeValue = 100;

    const happinessChange = isFound ? Math.max(1, Math.min(20 - miniGameState.attempts * 2, maxAttributeValue - profile.happiness)) : 0;
    const energyChange = isFound ? 20 - miniGameState.attempts * 2 : 0;
    const affectionChange = isFound ? Math.max(1, Math.min(20 - miniGameState.attempts * 2, maxAttributeValue - profile.affection)) : 0;
    const thirstChange = -2;
    const hungerChange = -3;
    const exerciseLevelChange = 1;

    const updateObject = {
      "miniGames.hideAndSeek": miniGameState,
      happiness: Math.min(profile.happiness + happinessChange, maxAttributeValue),
      affection: Math.min(profile.affection + affectionChange, maxAttributeValue),
      thirst: Math.max(profile.thirst + thirstChange, 0),
      hunger: Math.max(profile.hunger + hungerChange, 0),
      exerciseLevel: Math.min(profile.exerciseLevel + exerciseLevelChange, maxAttributeValue),
    };

    const energyChangeSign = energyChange >= 0 ? "+" : "-";
    const affectionChangeSign = affectionChange >= 0 ? "+" : "-";
    const happinessChangeSign = happinessChange >= 0 ? "+" : "-";

    const embed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle("Hide and Seek")
      .setDescription(`You found your pet in the ${locationObject.locationName}!`)
      .addFields(
        {
          name: "Energy",
          value: `${variables.getEnergy(profile.energy)} (${energyChangeSign}${Math.abs(energyChange)})`,
          inline: true,
        },
        {
          name: "Affection",
          value: `${variables.getAffection(profile.affection)} (${affectionChangeSign}${Math.abs(affectionChange)})`,
          inline: true,
        },
        {
          name: "Happiness",
          value: `${variables.getHappiness(profile.happiness)} (${happinessChangeSign}${Math.abs(happinessChange)})`,
          inline: true,
        },
        {
          name: "Attempts",
          value: `${miniGameState.attempts}`,
          inline: true,
        }
      )
      .setTimestamp();

    await updatePetProfile(userId, updateObject);
    await interaction.update({
      embeds: [embed],
      components: [],
    });
  } else {
    // Reset mini-game state when not found
    miniGameState.isFound = false;

    const content = `Your pet is not in the ${locationObject.locationName}.`;
    const hint = generateHint(miniGameState.attempts);

    const components = updateButtonStyles(interaction, locationObject.buttonId);
    const updateObject = {
      "miniGames.hideAndSeek": miniGameState,
    };

    const embed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle("Hide and Seek")
      .setDescription(content + hint)
      .addFields({ name: "Attempts", value: `Attempts: ${miniGameState.attempts}`, inline: true })
      .setTimestamp();

    await updatePetProfile(userId, updateObject);
    await interaction.update({
      embeds: [embed],
      components,
    });
  }
}

async function updatePetProfile(userId, updateObject) {
  try {
    await petProfile.findOneAndUpdate({ userId: userId }, updateObject);
  } catch (error) {
    console.error(`Error updating pet profile: ${error}`);
  }
}

function generateHint(attempts) {
  return attempts >= 3 ? " Your pet loves to hide in cozy spots!" : ""; // TODO: Add dynamic hints based on the location of the pet.
}

function updateButtonStyles(interaction, clickedButtonId) {
  return interaction.message.components.map(actionRow => {
    const updatedActionRow = ActionRowBuilder.from(actionRow.toJSON());
    updatedActionRow.components = actionRow.components.map(buttonComponent => {
      const button = ButtonBuilder.from(buttonComponent);
      if (buttonComponent.customId === clickedButtonId) {
        button.setStyle(ButtonStyle.Danger);
      }
      return button;
    });
    return updatedActionRow;
  });
}
