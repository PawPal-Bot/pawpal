const { ActionRowBuilder, ChannelType, ChannelSelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
    data: {
        name: 'adoptSelectMenu',
        description: 'Select menu for the adopt command',
    },
    async execute(interaction, client, guildDb) {

        const inter = new ActionRowBuilder()
            .addComponents(
         new StringSelectMenuBuilder()
        .setCustomId("adoptelectMenu")
        .setPlaceholder("Select a pet to adopt!")
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

        console.log("test<!!!!!!!!!!!!!!!")

        interaction.update({ components: [inter] });
    },
};
