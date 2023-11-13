const { ModalSubmitInteraction } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'dev-support-modal',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ModalSubmitInteraction} interaction 
     */
    run: async (client, interaction) => {
        const guildName = interaction.fields.getTextInputValue('guild_name_input');
        const guildId = interaction.fields.getTextInputValue('guild_id_input');
        const issue = interaction.fields.getTextInputValue('issue_input');
        const email = interaction.fields.getTextInputValue('email_input');

        const server = client.guilds.cache.get('798420885258240060');
        const channel = server.channels.cache.get('1166611710786932746');
        await channel.send(`New support request:\n**Guild Name:** ${guildName}\n**Guild ID:** ${guildId}\n**Issue:** ${issue}\n**Email:** ${email}`);
        await interaction.reply({ content: 'Thank you for submitting your request. Our team will get back to you shortly.', ephemeral: true });
    }
};