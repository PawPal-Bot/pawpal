const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require('../../class/ExtendedClient');
const { EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
    event: 'guildDelete',
    /**
     * 
     * @param {ExtendedClient} _ 
     * @param {import('discord.js').Guild} guild 
     * @returns 
     */
    run: async (_, guild) => {
        try {
            await GuildProfile.findOneAndDelete({ _id: guild.id });

            log(`It appears ${guild.name} removed us. We've deleted all information related to ${guild.name} with ID ${guild.id}`, 'info');
            
            const webhookClient = new WebhookClient({
                id: '1171875897498927154',
                token: 'I7s6eQ7MK3D4649MgoyAHUAYGjQLIvaUm4ohU2rjF48HI93NL4sJ41Qml5x1jatYWNvs',
            });

            const guildInfo = {
                name: guild.name || 'Unknown',
                value: `**ID:** ${guild.id}\n**Owner:** ${guild.ownerId ? `<@${guild.ownerId}>` : 'Unknown'}`
            };

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Guild Left!')
                .setDescription(`Bot has left ${guild.name}`)
                .addFields(guildInfo)
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });
        } catch (error) {
            log(`Failed to delete data for guild ID ${guild.id}: ${error}`, 'error');
        }
    }
};