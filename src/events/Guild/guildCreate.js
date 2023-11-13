const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require('../../class/ExtendedClient');
const { EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
    event: 'guildCreate',
    /**
     * 
     * @param {ExtendedClient} _ 
     * @param {import('discord.js').Guild} guild 
     * @returns 
     */
    run: async (_, guild) => {
        try {
            const newGuildData = new GuildProfile({
                _id: guild.id,
                guildName: guild.name,
            }, { timestamps: true });

            await newGuildData.save();

            log(`Huzzah! We've joined ${guild.name}. Created new data for ${guild.name} with ID ${guild.id}`, 'info');

            const webhookClient = new WebhookClient({
                id: '1171875897498927154',
                token: 'I7s6eQ7MK3D4649MgoyAHUAYGjQLIvaUm4ohU2rjF48HI93NL4sJ41Qml5x1jatYWNvs',
            });

            const guildInfo = {
                name: guild.name || 'Unknown',
                value: `**ID:** ${guild.id}\n**Owner:** ${guild.ownerId ? `<@${guild.ownerId}>` : 'Unknown'}\n**Members:** ${guild.memberCount || 'Unknown'}`
            };

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('New Guild Joined!')
                .setDescription(`Bot has joined ${guild.name}`)
                .addFields(guildInfo)
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });
        } catch (error) {
            log(`Failed to create data for guild ID ${guild.id}: ${error}`, 'error');
        }
    }
};
