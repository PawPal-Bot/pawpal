const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const os = require('os');

module.exports = {
  structure: new SlashCommandBuilder().setName('botstat').setDescription('[Dev Only] Tells developers important statistical information regarding the bot'),
  options: {
    cooldown: 5000,
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const startTime = Date.now();

    await interaction.deferReply();
    const roundTripTime = Date.now() - startTime;

    // Memory usage details
    const memoryUsage = process.memoryUsage();
    const usedHeapSize = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const totalHeapSize = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
    const externalMemory = (memoryUsage.external / 1024 / 1024).toFixed(2);
    const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2); // Resident set size

    // System and process information
    const cpuUsage = os.loadavg();
    const heartbeatPing = client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Bot Status')
      .addFields(
        { name: 'Last Reset', value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, inline: false },
        { name: 'Heap Memory Usage', value: `${usedHeapSize} MB / ${totalHeapSize} MB`, inline: false },
        { name: 'External Memory Usage', value: `${externalMemory} MB`, inline: false },
        { name: 'RSS', value: `${rss} MB`, inline: false },
        { name: 'CPU Load', value: `${cpuUsage[0].toFixed(2)}, ${cpuUsage[1].toFixed(2)}, ${cpuUsage[2].toFixed(2)}`, inline: false },
        { name: 'WebSocket heartbeat', value: `${heartbeatPing}ms`, inline: false },
        { name: 'Round-trip latency', value: `${roundTripTime}ms`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Bot Statistics', iconURL: client.user.avatarURL() });

    await interaction.editReply({ embeds: [embed] });
  },
};
