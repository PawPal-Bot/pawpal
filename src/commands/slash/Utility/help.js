const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const GuildProfile = require('../../../schemas/GuildSchema');
const paginationEmbed = require('../../../functions/paginationEmbed');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

module.exports = {
  structure: new SlashCommandBuilder().setName('help').setDescription('View all the possible commands!'),
  options: {
    cooldown: 15000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    let prefix = config.handler.prefix;

    if (config.handler?.mongodb?.toggle) {
      try {
        const data = await GuildProfile.findOne({ _id: interaction.guildId });
        if (data && data?.prefix) prefix = data.prefix;
      } catch (error) {
        console.error('Database Error:', error);
        prefix = config.handler.prefix;
      }
    }

    const allCommands = [];

    client.applicationcommandsArray.forEach(command => {
      if (!command.description.includes('[Dev Only]')) {
        allCommands.push(command);
      }
    });

    const formatCommand = command => {
      const commandName = capitalizeFirstLetter(command.name);
      const commandDescription = command.description || '*No description*';
      const commandUsage = `\`/${command.name}\``;
      const commandOptions = command.options?.map(option => `\`${option.name}\`: ${option.description}`).join('\n') || '';

      return {
        name: `**${commandName}**`,
        value: `**Description:**\n${commandDescription}\n\n**Usage:** ${commandUsage}\n${commandOptions}\n`,
      };
    };

    const allFields = allCommands.map(formatCommand);

    const pages = chunkArray(allFields, 2).map(chunk => {
      return new EmbedBuilder().addFields(...chunk);
    });

    client.pages = pages;
    client.currentPage = 0;

    const nextPageButton = new ButtonBuilder().setCustomId('next').setLabel('Next Page').setStyle(ButtonStyle.Primary);

    const buttons = [nextPageButton];

    try {
      await paginationEmbed(interaction, pages, buttons);
      paginationEmbed.disableButtonsAfterTimeout(interaction, buttons, 240000);
    } catch (error) {
      console.error('Error sending paginated embed:', error);
      await interaction.followUp('There was an error processing your request.');
    }
  },
};
