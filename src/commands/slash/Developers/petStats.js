// Work in Progress

const { SlashCommandBuilder, SlashCommandStringOption, EmbedBuilder } = require('discord.js');
const petProfile = require('../../../schemas/PetModel');

module.exports = {
  structure: new SlashCommandBuilder()
    .setName('petstats')
    .setDescription('[Dev Only] Get comprehensive statistics on pets')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('type')
        .setDescription('Select the type of statistics')
        .setRequired(true)
        .addChoices({ name: 'Count', value: 'count' }, { name: 'Percentiles', value: 'percentiles' }, { name: 'Overview', value: 'overview' })
    ),
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

    const statsType = interaction.options.getString('type');

    switch (statsType) {
      case 'count':
        const countStats = await getCountStats();
        const countEmbed = createCountEmbed(countStats);
        await interaction.editReply({ embeds: [countEmbed] });
        break;
      case 'percentiles':
        const percentileStats = await getPercentileStats();
        const percentileEmbed = createPercentileEmbed(percentileStats);
        await interaction.editReply({ embeds: [percentileEmbed] });
        break;
      case 'overview':
        const overviewStats = await getOverviewStats();
        const overviewEmbed = createOverviewEmbed(overviewStats);
        await interaction.editReply({ embeds: [overviewEmbed] });
        break;
    }
  },
};

async function getCountStats() {
  const countResult = await petProfile.aggregate([{ $group: { _id: '$lifeStage', count: { $sum: 1 } } }]);
  return countResult;
}

// Function to create an embed for count-based statistics
function createCountEmbed(stats) {
  const embed = new EmbedBuilder().setTitle('Count-based Statistics').setColor(0x0099ff);

  // Check if stats is an array
  if (Array.isArray(stats)) {
    stats.forEach(stat => {
      embed.addFields({
        name: `Life Stage ${stat._id}`,
        value: `${stat.count} pets`,
        inline: true,
      });
    });
  } else {
    embed.addFields({
      name: 'Error',
      value: 'No data available',
      inline: true,
    });
  }

  return embed;
}

// Function for percentile-based statistics
async function getPercentileStats() {
  const percentileResult = await petProfile.aggregate([{ $group: { _id: null, medianHappiness: { $avg: '$happiness' } } }]);
  return createPercentileEmbed(percentileResult[0]);
}

// Function to create an embed for percentile-based statistics
function createPercentileEmbed(stats) {
  // Check if stats is defined and has the property 'medianHappiness'
  if (!stats || typeof stats.medianHappiness !== 'number') {
    return new EmbedBuilder()
      .setTitle('Percentile-based Statistics')
      .setColor(0xff0000) // Red color for error
      .addFields({ name: 'Error', value: 'No data available', inline: true });
  }

  return new EmbedBuilder()
    .setTitle('Percentile-based Statistics')
    .setColor(0x0099ff)
    .addFields({
      name: 'Median Happiness',
      value: `${stats.medianHappiness.toFixed(2)}`,
      inline: true,
    });
}

// Function to get an overview of pet statistics
async function getOverviewStats() {
  const overview = await petProfile.aggregate([
    {
      $group: {
        _id: null,
        totalPets: { $sum: 1 },
        averageHappiness: { $avg: '$happiness' },
        averageHunger: { $avg: '$hunger' },
        averageThirst: { $avg: '$thirst' },
        averageHealth: { $avg: '$health' },
        averageEnergy: { $avg: '$energy' },
        averageCleanliness: { $avg: '$cleanliness' },
        averageAffection: { $avg: '$affection' },
        averageDiscipline: { $avg: '$discipline' },
        averageTrainingLevel: { $avg: '$trainingLevel' },
      },
    },
  ]);

  return overview.length > 0 ? overview[0] : null;
}

// Function to create an embed for the overview response
function createOverviewEmbed(stats) {
  const embed = new EmbedBuilder().setTitle('Overview Statistics').setColor(0x0099ff);

  if (!stats) {
    embed.addFields({
      name: 'Error',
      value: 'No data available',
      inline: true,
    });
    return embed;
  }

  embed.addFields(
    { name: '🐾 Total Pets', value: `${stats.totalPets || 'N/A'}`, inline: true },
    { name: '😊 Average Happiness', value: formatStat(stats.averageHappiness), inline: true },
    { name: '🍔 Average Hunger', value: formatStat(stats.averageHunger), inline: true },
    { name: '💧 Average Thirst', value: formatStat(stats.averageThirst), inline: true },
    { name: '❤️ Average Health', value: formatStat(stats.averageHealth), inline: true },
    { name: '⚡ Average Energy', value: formatStat(stats.averageEnergy), inline: true },
    { name: '🛁 Average Cleanliness', value: formatStat(stats.averageCleanliness), inline: true },
    { name: '💕 Average Affection', value: formatStat(stats.averageAffection), inline: true },
    { name: '🎓 Average Discipline', value: formatStat(stats.averageDiscipline), inline: true },
    { name: '🏋️‍♂️ Average Training Level', value: formatStat(stats.averageTrainingLevel), inline: true }
  );

  return embed;
}

// Helper function to format statistic values
function formatStat(value) {
  return value ? `${value.toFixed(2)}` : 'N/A';
}
