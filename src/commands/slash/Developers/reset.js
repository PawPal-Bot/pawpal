const { SlashCommandBuilder } = require('discord.js');
const petProfile = require('../../../schemas/PetModel');

module.exports = {
  structure: new SlashCommandBuilder().setName('reset').setDescription('[Dev Only] Force reset profile back to default values'),
  options: {
    cooldown: 5000,
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();
    const userId = interaction.user.id;
    const currentProfile = await petProfile.findOne({ userId });
    const defaultPetProfile = new petProfile({ userId });
    const resetProfile = {
      ...defaultPetProfile.toObject(),
      userId: currentProfile.userId,
      petId: currentProfile.petId,
      petName: currentProfile.petName,
      petType: currentProfile.petType,
      hasPet: currentProfile.hasPet,
    };
    delete resetProfile._id; // Delete the _id field
    await petProfile.updateOne({ userId }, { $set: resetProfile }, { upsert: true });
    await interaction.editReply('Your pet profile has been reset to default values.');
  },
};
