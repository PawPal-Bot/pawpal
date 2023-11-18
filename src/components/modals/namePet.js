const { ModalSubmitInteraction, EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const petProfile = require("../../schemas/PetModel");

module.exports = {
  customId: "namePetModal",
  description: "Modal for naming the pet",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    const petName = interaction.fields.getTextInputValue("petNameInput");
    const userRecord = await petProfile.findOne({ userId: interaction.user.id }).exec();
    const petType = userRecord.petType;

    if (!petName || petName.length > 25 || petName.split(" ").length > 3) {
      return interaction.reply({
        content: "Please provide a valid name. Max 25 chars and no more than 2 spaces are permitted.",
        ephemeral: true,
      });
    }

    const petMap = {
      1: "Dog 🐶",
      2: "Cat 🐱",
      3: "Red Panda 🐼",
    };

    const selectedPetLabel = petMap[petType];

    await petProfile.findOneAndUpdate({ userId: interaction.user.id }, { petName: petName, hasPet: true }, { upsert: true }).exec();

    const careInstructions = `
            1. Feed your pet twice a day.\n
            2. Take your pet for a walk at least once a day.\n
            3. Provide fresh water every day.\n
            4. Regular check-ups with the vet.\n
            5. ... and lots of love and cuddles!\n
        `;

    const updatedEmbed = new EmbedBuilder()
      .setTitle(`Adoption Successful!`)
      .setDescription(`Oh great, your little ${selectedPetLabel} is ${petName}. That's gorgeous!\n**How to Care for Your Pet:**\n${careInstructions}`);

    await interaction.update({
      embeds: [updatedEmbed],
      components: [],
    });
  },
};
