const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adopt")
    .setDescription("Adopt a pet!")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("pet")
            .setDescription("Adopt a pet!")
    ),

  async execute(interaction, client) {
    const adoptEmbed = new EmbedBuilder()

        .setTitle("Adopt a pet!")
        .setDescription("Click the button below to adopt a pet!")
        .setColor("#9e38fe")
// instead of a button you can use a select menu

    const adoptButton = new StringSelectMenuBuilder()
        .setCustomId("adopt")
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

      
    await interaction.reply({
      embeds: [adoptEmbed],
        components: [new ActionRowBuilder().addComponents(adoptButton)]
    });
  },
};
