const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const GuildProfile = require('../../../schemas/GuildSchema');
const paginationEmbed = require('../../../functions/paginationEmbed');

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

module.exports = {
  structure: new SlashCommandBuilder().setName('listguilds').setDescription('[Dev Only] Displays a list of all guild names and their corresponding IDs'),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    await interaction.deferReply();

    try {
      const guilds = await GuildProfile.find({});

      const formatGuild = guild => ({
        name: guild.guildName || 'Unknown',
        value: `**ID:** ${guild._id}`,
      });

      const allFields = guilds.map(formatGuild);

      const pages = chunkArray(allFields, 5).map((chunk, index) => {
        return new EmbedBuilder()
          .setTitle('List of Guilds')
          .setDescription('A list of all the guilds PawPal is in.')
          .addFields(...chunk)
          .setFooter({ text: `Total Guilds: ${guilds.length}` });
      });

      const firstPageButton = new ButtonBuilder().setCustomId('first').setEmoji('1029435230668476476').setStyle(ButtonStyle.Primary);

      const previousPageButton = new ButtonBuilder().setCustomId('previous').setEmoji('1029435199462834207').setStyle(ButtonStyle.Primary);

      const nextPageButton = new ButtonBuilder().setCustomId('next').setEmoji('1029435213157240892').setStyle(ButtonStyle.Primary);

      const lastPageButton = new ButtonBuilder().setCustomId('last').setEmoji('1029435238948032582').setStyle(ButtonStyle.Primary);

      const buttons = [firstPageButton, previousPageButton, nextPageButton, lastPageButton];

      await paginationEmbed(interaction, pages, buttons);
      paginationEmbed.disableButtonsAfterTimeout(interaction, buttons, 240000);
    } catch (error) {
      console.error('Error fetching guilds or sending paginated embed:', error);
      await interaction.followUp('There was an error processing your request.');
    }
  },
};
