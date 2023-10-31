const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  ModalBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get")
    .setDescription("Get started with AdoptMe!")
    .addSubcommand((subcommand) =>
      subcommand.setName("started").setDescription("Get started with AdoptMe!")
    ),

  async execute(interaction, client, userDb) {
    interaction.client = interaction.client || {}; // Initialize interaction.client if it's undefined
    interaction.client.userStates = interaction.client.userStates || {}; // Initialize userStates if it's undefined
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
    console.log("Sending Starting Embed...");
    await interaction.reply({
      embeds: [startingEmbed],
      components: [
        new ActionRowBuilder().addComponents(selectMenu), // Changed the type to 1
      ],
    });

    // Listen for the interaction with the select menu
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      // Check if the select menu interaction is for choosing a pet
      if (interaction.customId === "getCreateMenu") {
        // Get the selected pet type from the interaction
        const selectedPetType = interaction.values[0]; // Assuming only one option can be selected
        console.log("Selected Pet Type:", selectedPetType);

        // Save the selected pet type to the database
        try {
          await userModel
            .findOneAndUpdate(
              { userId: interaction.user.id },
              { petType: selectedPetType },
              { upsert: true }
            )
            .exec();
          console.log("Saved Pet Type to Database:", selectedPetType);
        } catch (error) {
          console.error("Error updating pet type:", error);
          interaction.reply({
            content:
              "An error occurred while processing your request. Please try again later.",
            ephemeral: true,
          });
          return;
        }

        // Get the label of the selected pet type
        let selectedPetLabel;
        if (selectedPetType === "1") {
          selectedPetLabel = "Dog";
        } else if (selectedPetType === "2") {
          selectedPetLabel = "Cat";
        } else if (selectedPetType === "3") {
          selectedPetLabel = "Red Panda";
        }
        console.log("Selected Pet Label:", selectedPetLabel);

        interaction.client.userStates[interaction.user.id] = {
          state: "awaitingPetName",
          selectedPetLabel,
        };

        // Now, you can initiate and show the modal for naming the pet with the selected pet type's label
        const petNameInput = new TextInputBuilder()
          .setLabel("Pet Name")
          .setCustomId("petNameInput")
          .setPlaceholder(
            `Enter your ${selectedPetLabel}'s name. Max 25 chars and no more than 2 spaces are permitted.`
          )
          .setStyle("Short")
          .setRequired(true);

        const petNameActionRow = new ActionRowBuilder().addComponents(
          petNameInput
        );

        const modal = new ModalBuilder()
          .setTitle(`Name Your ${selectedPetLabel}`)
          .setCustomId("namePetModal")
          .addComponents(petNameActionRow);

        // Show the modal
        console.log("Showing Modal...");
        await interaction.showModal(modal);
      }
    });
  },
};
