const { generateEmbeds, generateButtons } = require("../../functions/petUtils");
const petProfile = require("../../schemas/PetModel");

module.exports = {
  customId: "about_previous",
  public: false,
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.user.id !== interaction.user.id) { return interaction.reply({ content: "You are not the owner of this button.", ephemeral: true }); }
    
    const parts = interaction.customId.split("_");
    const currentPageIndex = parseInt(parts[2], 10);
    const previousPageIndex = currentPageIndex - 1;

    const userDb = await petProfile.findOne({ userId: interaction.user.id });

    if (!userDb || userDb.petType === 0) {
      await interaction.reply({
        content: "You don't have a pet to display information for.",
        ephemeral: true,
      });
      return;
    }

    const embeds = generateEmbeds(userDb);
    if (previousPageIndex < 0 || previousPageIndex >= embeds.length) {
      return;
    }
    const buttons = generateButtons(previousPageIndex, embeds.length);

    await interaction.update({
      embeds: [embeds[previousPageIndex]],
      components: [buttons],
    });
  },
};
