const { ActionRowBuilder, ChannelType, ChannelSelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
const userModel = require('../util/Models/userModel');
module.exports = {
    data: {
        name: 'adoptSelectMenu',
        description: 'Select menu for the adopt command',
    },
    async execute(interaction, client, userDb) {
        if(interaction.message.interaction.user.id !== interaction.user.id) return interaction.reply({ content: "This button does not belong to you it belongs to " + interaction.message.interaction.user.username, ephemeral: true })

        const inter = new ActionRowBuilder()
            .addComponents(
         new StringSelectMenuBuilder()
        .setCustomId("adoptelectMenu")
        .setPlaceholder("Select a pet to adopt!")
        .setDisabled(true)
        .setMaxValues(1)
        .setMinValues(1)
        .addOptions([
            {
                label: "Dog",
                value: "1",
                description: "Adopt a dog!",
                emoji: "🐶"
            },
            {
                label: "Cat",
                value: "2",
                description: "Adopt a cat!",
                emoji: "🐱"
            },
            {
                label: "Red Panda",
                value: "3",
                description: "Adopt a red panda!",
                emoji: "🐼"
            }
  
        ])
        )

        const petMap = {
            1: "Dog 🐶",
            2: "Cat 🐱",
            3: "Red Panda 🐼"
        }

        await userModel.findOneAndUpdate({ userId: interaction.user.id }, { petType: interaction.values[0], hasPet: true }, { upsert: true }).exec();

        interaction.update({ components: [inter] });

        return interaction.reply({ content: "You have adopted a " + petMap[interaction.values[0]] + "!", ephemeral: true });
    },
};
