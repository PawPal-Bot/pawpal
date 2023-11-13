const { ButtonInteraction, MessageActionRow, ButtonBuilder, ButtonStyle } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'cancel',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.message.delete();
    }
};
