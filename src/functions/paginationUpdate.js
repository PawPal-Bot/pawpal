const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");

async function paginationUpdate(interaction, pages, currentPage) {
  const footer = "Page {current}/{total}";
  await interaction.update({
    embeds: [pages[currentPage].setFooter({ text: footer.replace("{current}", currentPage + 1).replace("{total}", pages.length + " • © PawPal") })],
    components: [getActionRow(currentPage, pages.length)],
  });
}

function getActionRow(currentPage, totalPages) {
  const previousButton = new ButtonBuilder()
    .setCustomId("previous")
    .setStyle(ButtonStyle.Primary)
    .setLabel("Previous Page")
    .setDisabled(currentPage === 0);

  if (totalPages < 3) {
    // Less than 3 pages, hide "First Page" and "Last Page"
    if (totalPages < 2 && currentPage === 1) {
      // Hide "Next Page" when on the 2nd page and fewer than 2 pages
      return new ActionRowBuilder().addComponents([previousButton]);
    } else {
      // Show "Next Page" and "Previous Page"
      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Next Page")
        .setDisabled(currentPage === totalPages - 1);
      return new ActionRowBuilder().addComponents([previousButton, nextButton]);
    }
  } else {
    // More than 2 pages, show "First Page" and "Last Page" only if totalPages > 10
    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Next Page")
      .setDisabled(currentPage === totalPages - 1);

    const actionRow = new ActionRowBuilder().addComponents([previousButton, nextButton]);

    if (totalPages > 10) {
      const firstButton = new ButtonBuilder()
        .setCustomId("first")
        .setStyle(ButtonStyle.Primary)
        .setLabel("First Page")
        .setDisabled(currentPage === 0);

      const lastButton = new ButtonBuilder()
        .setCustomId("last")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Last Page")
        .setDisabled(currentPage === totalPages - 1);

      actionRow.addComponents([firstButton, lastButton]);
    }

    return actionRow;
  }
}

module.exports = { paginationUpdate };
