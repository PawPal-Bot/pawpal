const config = require('../../config');
const { log } = require('../../functions');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    event: 'interactionCreate',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {import('discord.js').Interaction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            let component;
        
            // Split the customId by underscore to isolate the base identifier
            const parts = interaction.customId.split('_');
            const baseCustomId = parts[0]; // This should be 'hideandseek' if following the previous convention

            if (interaction.isButton()) {
                // Get the component using the base identifier only, not the full customId
                component = client.collection.components.buttons.get(baseCustomId);
            } else if (interaction.isAnySelectMenu()) {
                component = client.collection.components.selects.get(interaction.customId);
            } else if (interaction.isModalSubmit()) {
                component = client.collection.components.modals.get(interaction.customId);
            }
        
            if (component) {
                if (!component.public && (!interaction.message.interaction || interaction.message.interaction.user.id !== interaction.user.id)) {
                    return await interaction.reply({
                        content: `This component belongs to ${interaction.message.interaction.user.username}`,
                        ephemeral: true,
                    });
                } 
                try {
                    await component.run(client, interaction);
                } catch (error) {
                    console.error(error);
                }
            } else {
                const parts = interaction.customId.split('_');
                const baseCustomId = parts.slice(0, -1).join('_');
                const pageIndex = parseInt(parts[parts.length - 1], 10);
    
                component = client.collection.components.buttons.get(baseCustomId);
    
                if (component) {
                    if (!component.public && (!interaction.message.interaction || interaction.message.interaction.user.id !== interaction.user.id)) {
                        return await interaction.reply({
                            content: `This component belongs to ${interaction.message.interaction.user.username}`,
                            ephemeral: true,
                        });
                    }
    
                    try {
                        component.run(client, interaction, pageIndex);
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    console.log(`No component found for customId: ${interaction.customId}`);
                }
            }
        }
    }
    };