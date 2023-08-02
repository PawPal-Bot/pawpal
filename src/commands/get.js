const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get")
    .setDescription("Get started with AdoptMe!")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("started")
            .setDescription("Get started with AdoptMe!")
    ),

  async execute(interaction, client) {
    const startingEmbed = new EmbedBuilder()

      .setTitle("Welcome to AdoptMe!")
      .setDescription("AdoptMe is a Discord bot that lets you keep a virtual pet!")
      .setColor("#9e38fe")
      .addFields({name: "Getting Started", value: "To get started, you'll need to adopt a pet. You can do this by using the `/adopt` command."})

    await interaction.reply({
      embeds: [startingEmbed]
    });
  },
};