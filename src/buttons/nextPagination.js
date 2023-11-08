const { generateEmbeds, generateButtons } = require("../util/petUtils");

module.exports = {
  data: {
    name: "about_next",
    description: "Handles the 'Next' button interaction for pet about pagination"
  },
  async execute(interaction, client) {
    const parts = interaction.customId.split('_');
    const currentPageIndex = parseInt(parts[2], 10);
    const nextPageIndex = currentPageIndex + 1;

    const userDb = await client.database.getUser(interaction.user.id, true);

    if (!userDb || userDb.petType === 0) {
      await interaction.reply({
        content: "You don't have a pet to display information for.",
        ephemeral: true
      });
      return;
    }

    const embeds = generateEmbeds(userDb);
    const totalPages = embeds.length;

    if (nextPageIndex >= totalPages) {
      return;
    }

    const buttons = generateButtons(nextPageIndex, totalPages);

    await interaction.update({
      embeds: [embeds[nextPageIndex]],
      components: [buttons]
    });
  }
};
