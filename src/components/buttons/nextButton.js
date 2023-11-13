const { ButtonInteraction } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { paginationUpdate } = require('../../functions/paginationUpdate');

module.exports = {
    customId: 'next',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            let currentPage = client.currentPage;
            if (currentPage < client.pages.length - 1) {
                currentPage++;
                client.currentPage = currentPage;
                await paginationUpdate(interaction, client.pages, currentPage);
            }
        } catch (error) {
            console.error('Error in nextButton.js:', error);
        }
    }
}