const { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, PermissionsBitField, TextInputStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('devsupport')
        .setDescription('Creates a form to send a support request to PawPal developers'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            }

            const guildName = interaction.guild.name;
            const guildId = interaction.guild.id;

            const guildNameInput = new TextInputBuilder()
            .setLabel('Guild Name')
            .setCustomId('guild_name_input')
            .setPlaceholder('Guild Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(guildName);
        
        const guildIdInput = new TextInputBuilder()
            .setLabel('Guild ID')
            .setCustomId('guild_id_input')
            .setPlaceholder('Guild ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(guildId);

            const issueInput = new TextInputBuilder()
                .setLabel('Issue')
                .setCustomId('issue_input')
                .setPlaceholder('Describe your issue...')
                .setMaxLength(1000)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            
            const emailInput = new TextInputBuilder()
                .setLabel('Contact Email')
                .setCustomId('email_input')
                .setPlaceholder('Enter your email...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const guildNameActionRow = new ActionRowBuilder().addComponents(guildNameInput);
            const guildIdActionRow = new ActionRowBuilder().addComponents(guildIdInput);
            const issueActionRow = new ActionRowBuilder().addComponents(issueInput);
            const emailActionRow = new ActionRowBuilder().addComponents(emailInput);

            const modal = new ModalBuilder()
            .setTitle('Developer Support')
            .setCustomId('dev-support-modal')
            .addComponents(guildNameActionRow, guildIdActionRow, issueActionRow, emailActionRow);
        
        await interaction.showModal(modal);
    
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
}
};