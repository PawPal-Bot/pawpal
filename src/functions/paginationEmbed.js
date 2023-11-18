const { ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require("discord.js");

/**
 * @param {Interaction} interaction
 * @param {EmbedBuilder[]} pages
 * @param {ButtonBuilder[]} buttons
 * @param {number} timeout
 * @param {string} footer
 */
module.exports = async (interaction, pages, buttons, timeout = 240000, footer = "Page {current}/{total}") => {
  if (!pages) throw new Error("No pages provided.");
  if (isNaN(timeout)) throw new Error("Timeout is not a number.");
  if (timeout < 0) throw aError("Timeout cannot be less than 0.");
  if (!interaction) throw new Error("No interaction provided.");
  if (typeof footer !== "string") throw new Error("Footer is not a string.");
  if (buttons && buttons.some(button => button.data.style === ButtonStyle.Link)) {
    throw new Error("Buttons cannot be links.");
  }

  if (!interaction.deferred) await interaction.deferReply();

  if (pages.length === 1) {
    await interaction.editReply({ embeds: [pages[0]] });
  } else {
    const components = new ActionRowBuilder();
    if (buttons) {
      buttons.forEach(button => components.addComponents(button));
    }

    await interaction.editReply({
      embeds: [pages[0].setFooter({ text: footer.replace("{current}", 1).replace("{total}", pages.length + " • © PawPal") })],
      components: [components],
    });
  }
};

module.exports.disableButtonsAfterTimeout = async (interaction, buttons, timeout) => {
  setTimeout(async () => {
    try {
      await interaction.editReply({
        components: [new ActionRowBuilder().addComponents(buttons.map(b => b.setDisabled(true)))],
      });
    } catch (error) {
      console.error(error);
    }
  }, timeout);
};
