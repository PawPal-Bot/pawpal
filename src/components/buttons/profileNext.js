const { generateEmbeds, generateButtons } = require("../../functions/petUtils");
const PetProfile = require("../../schemas/PetModel");

module.exports = {
  customId: "about_next",
  public: false,
  /**
   * 
   * @param {ExtendedClient} client 
   * @param {ButtonInteraction} interaction 
   */
  run: async (client, interaction) => {
    const parts = interaction.customId.split('_');
    const currentPageIndex = parseInt(parts[2], 10);
    const nextPageIndex = currentPageIndex + 1;

    try {
      // Use the mongoose connection to fetch the pet profile
      const petProfile = await PetProfile.findOne({ userId: interaction.user.id });

      if (!petProfile || petProfile.petType === 0) {
        await interaction.reply({
          content: "You don't have a pet to display information for.",
          ephemeral: true
        });
        return;
      }

      const embeds = generateEmbeds(petProfile);
      const totalPages = embeds.length;

      if (nextPageIndex >= totalPages) {
        return;
      }

      const buttons = generateButtons(nextPageIndex, totalPages);

      await interaction.update({
        embeds: [embeds[nextPageIndex]],
        components: [buttons]
      });
    } catch (error) {
      // Handle any database or other errors that may occur
      console.error("Error in run function:", error);
      await interaction.reply({
        content: "An error occurred while fetching pet data.",
        ephemeral: true
      });
    }
  }
};
