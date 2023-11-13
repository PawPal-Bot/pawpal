const petProfile = require('../../schemas/PetModel');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'hideandseek',

    /**
     * @param {ExtendedClient} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        const userId = interaction.user.id;
        const profile = await petProfile.findOne({ userId: userId });
        const miniGameState = profile.miniGames.hideAndSeek;

        const locationObject = miniGameState.buttonLocations.find(loc => loc.buttonId === interaction.customId);
        if (!locationObject) {
            return await interaction.reply({ content: 'This button is no longer active.', ephemeral: true });
        }

        await handleGameLogic(interaction, miniGameState, locationObject, userId);

        if (miniGameState.isFound || interaction.customId === 'give_up') {
            await resetMiniGameState(userId);
        }
    }
};

async function handleGameLogic(interaction, miniGameState, locationObject, userId) {
    const isFound = Math.random() < (1 / (5 - miniGameState.attempts)); 
    miniGameState.attempts++;

    if (isFound) {
        miniGameState.isFound = true;
        await updatePetProfile(userId, { 'miniGames.hideAndSeek': miniGameState });
        await interaction.update({ content: `You found your pet in the ${locationObject.locationName}!`, components: [] });
    } else {
        const content = `Your pet is not in the ${locationObject.locationName}.`;
        const hint = generateHint(miniGameState.attempts);

        const components = updateButtonStyles(interaction, locationObject.buttonId);
        await updatePetProfile(userId, { 'miniGames.hideAndSeek': miniGameState });
        await interaction.update({ content: content + hint, components });
    }
}

async function updatePetProfile(userId, updateObject) {
    try {
        await petProfile.updateOne({ userId: userId }, { $set: updateObject });
    } catch (error) {
        console.error(`Error updating pet profile: ${error}`);
    }
}

function generateHint(attempts) {
    return attempts >= 3 ? ' Your pet loves to hide in cozy spots!' : ''; // TODO: Add dynamic hints based on the location of the pet.
}

function updateButtonStyles(interaction, clickedButtonId) {
    return interaction.message.components.map(actionRow => {
        const updatedActionRow = ActionRowBuilder.from(actionRow.toJSON());
        updatedActionRow.components = actionRow.components.map(buttonComponent => {
            const button = ButtonBuilder.from(buttonComponent);
            if (buttonComponent.customId === clickedButtonId) {
                button.setStyle(ButtonStyle.Danger);
            }
            return button;
        });
        return updatedActionRow;
    });
}

async function resetMiniGameState(userId) {
    const resetState = {
        'miniGames.hideAndSeek.isActive': false,
        'miniGames.hideAndSeek.attempts': 0,
        'miniGames.hideAndSeek.isFound': false,
        'miniGames.hideAndSeek.buttonLocations': []
    };
    await updatePetProfile(userId, resetState);
}