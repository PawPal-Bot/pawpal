const { generateEmbeds, generateButtons } = require("../util/petUtils");

module.exports = {
  data: {
    name: "about_previous",
  },
  async execute(interaction, client) {
    const parts = interaction.customId.split('_');
    const currentPageIndex = parseInt(parts[2], 10);
    const previousPageIndex = currentPageIndex - 1;

    const userDb = await client.database.getUser(interaction.user.id, true);

    if (!userDb || userDb.petType === 0) {
      await interaction.reply({
        content: "You don't have a pet to display information for.",
        ephemeral: true
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
