const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get")
    .setDescription("Get started with PawPal!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("started")
        .setDescription("Commence the initial setup for PawPal.")
    ),

  async execute(interaction, client, userDb) {
    const userId = interaction.user.id;

    try {
      userDb = await userModel
        .findOneAndUpdate(
          { userId },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        .exec();
    } catch (error) {
      console.error("Create/Fetch User Error >", error);
      await interaction.reply({
        content:
          "An error occurred while processing your request. Please try again later.",
        ephemeral: true,
      });
      return;
    }

    // Now proceed with the rest of your code, userDb should be defined
    if (userDb.hasPet) {
      const alreadyHavePetEmbed = new EmbedBuilder()
        .setTitle("You already have a pet!")
        .setDescription("You can't adopt another one!")
        .setColor("#ff0000");

      await interaction.reply({
        embeds: [alreadyHavePetEmbed],
      });
      return;
    }
    const startingEmbed = new EmbedBuilder()
      .setTitle("Welcome to AdoptMe!")
      .setDescription(
        "AdoptMe is a Discord bot that lets you keep a virtual pet!"
      )
      .setColor("#9e38fe")
      .addFields({
        name: "Getting Started",
        value: "Choose a pet type to adopt by selecting from the menu below.",
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("getCreateMenu")
      .setPlaceholder("Select a pet to adopt!")
      .addOptions([
        {
          label: "Dog",
          value: "1",
          description: "Adopt a dog!",
          emoji: "🐶",
        },
        {
          label: "Cat",
          value: "2",
          description: "Adopt a cat!",
          emoji: "🐱",
        },
        {
          label: "Red Panda",
          value: "3",
          description: "Adopt a red panda!",
          emoji: "🐼",
        },
      ]);

    // Show the select menu to choose a pet type
    await interaction.reply({
      embeds: [startingEmbed],
      components: [
        new ActionRowBuilder().addComponents(selectMenu), // Changed the type to 1
      ],
    });
  },
};
