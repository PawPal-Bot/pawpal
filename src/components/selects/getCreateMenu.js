const { ActionRowBuilder, StringSelectMenuBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const petProfile = require("../../schemas/PetModel");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "getCreateMenu",
  description: "Select menu for the get command",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const petMap = {
      1: "Dog 🐶",
      2: "Cat 🐱",
      3: "Red Panda 🐼",
    };
    const selectedPetLabel = petMap[interaction.values[0]];

    try {
      await petProfile.findOneAndUpdate({ userId: interaction.user.id }, { petType: interaction.values[0], hasPet: true }, { upsert: true }).exec();
    } catch (error) {
      console.error("Error updating pet type:", error);
      await interaction.reply({ content: "An error occurred. Please try again later.", ephemeral: true });
      return;
    }

    const petNameInput = new TextInputBuilder()
      .setLabel("Pet Name")
      .setCustomId("petNameInput")
      .setPlaceholder(`Enter your ${selectedPetLabel}'s name. Max 25 chars and no more than 2 spaces are permitted.`)
      .setStyle("Short")
      .setRequired(true);

    const petNameActionRow = new ActionRowBuilder().addComponents(petNameInput);

    const modal = new ModalBuilder().setTitle(`Name Your ${selectedPetLabel}`).setCustomId("namePetModal").addComponents(petNameActionRow);

    await interaction.showModal(modal);
  },
};
