const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const userModel = require('../util/Models/userModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adopt")
    .setNameLocalizations({
      de: "haustier",
 })
    .setDescription("Adopt a pet!")
    .setDMPermission(true)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("pet")
            .setNameLocalizations({
                de: "adoptieren",
           })
            .setDescription("Adopt a pet!")
    ),

  async execute(interaction, client) {
    const userDb = await userModel.findOne({ userId: interaction.user.id });

    const adoptEmbed = new EmbedBuilder()

        .setTitle("Adopt a pet!")
        .setDescription("Click the button below to adopt a pet!")
        .setColor("#9e38fe")
// instead of a button you can use a select menu

    const adoptButton = new StringSelectMenuBuilder()
        .setCustomId("adoptSelectMenu")
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


      if(userDb.petType !== 0) {
        adoptEmbed.setDescription("You already have a pet! You can't adopt another one!");
        adoptButton.setDisabled(true);
      }


    await interaction.reply({
      embeds: [adoptEmbed],
        components: userDb.petType ? [] : [new ActionRowBuilder().addComponents(adoptButton)]
    });
  },
};
