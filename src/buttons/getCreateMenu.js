const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  TextInputBuilder,
  ModalBuilder,
  Events,
} = require("discord.js");
const userModel = require("../util/Models/userModel");

module.exports = {
  data: {
    name: "getCreateMenu",
    description: "Select menu for the get command",
  },
  async execute(interaction, client, userDb) {
    const inter = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("getcreatemenu")
        .setPlaceholder("Select a pet to adopt!")
        .setDisabled(true)
        .setMaxValues(1)
        .setMinValues(1)
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
        ])
    );

    const petMap = {
      1: "Dog 🐶",
      2: "Cat 🐱",
      3: "Red Panda 🐼",
    };

    let selectedPetLabel = petMap[interaction.values[0]];

    const petNameInput = new TextInputBuilder()
      .setLabel("Pet Name")
      .setCustomId("petNameInput")
      .setPlaceholder(
        `Enter your ${selectedPetLabel}'s name. Max 25 chars and no more than 2 spaces are permitted.`
      )
      .setStyle("Short")
      .setRequired(true);

    const petNameActionRow = new ActionRowBuilder().addComponents(petNameInput);

    const modal = new ModalBuilder()
      .setTitle(`Name Your ${selectedPetLabel}`)
      .setCustomId("namePetModal")
      .addComponents(petNameActionRow);

    await interaction.showModal(modal);

    client.once(Events.InteractionCreate, async (modalInteraction) => {
      if (
        !modalInteraction.isModalSubmit() ||
        modalInteraction.customId !== "namePetModal" ||
        modalInteraction.user.id !== interaction.user.id
      ) {
        return;
      }

      // Get the pet name from the modal submission
      const petName = modalInteraction.fields.getTextInputValue("petNameInput");

      if (!petName || petName.length > 25 || petName.split(" ").length > 3) {
        return modalInteraction.reply({
          content:
            "Please provide a valid name. Max 25 chars and no more than 2 spaces are permitted.",
          ephemeral: true,
        });
      }

      try {
        // Check if a document with the specified userId already exists
        const existingUser = await userModel
          .findOne({ userId: modalInteraction.user.id })
          .exec();

        // Update or create the document
        await userModel
          .findOneAndUpdate(
            { userId: modalInteraction.user.id },
            {
              petType: interaction.values[0],
              petName: petName,
              hasPet: true,
            },
            { upsert: true }
          )
          .exec();

        const careInstructions = `
            1. Feed your pet twice a day.\n
            2. Take your pet for a walk at least once a day.\n
            3. Provide fresh water every day.\n
            4. Regular check-ups with the vet.\n
            5. ... and lots of love and cuddles!\n
          `;

        const updatedEmbed = new EmbedBuilder()
          .setTitle(`Adoption Successful!`)
          .setDescription(
            `Oh great, your little ${selectedPetLabel} is ${petName}. That's gorgeous!\n**How to Care for Your Pet:**\n${careInstructions}`
          );

        // Update the original interaction
        await modalInteraction.update({
          embeds: [updatedEmbed],
          components: [],
        });
      } catch (error) {
        console.error("Error updating pet name:", error);
        modalInteraction.reply({
          content:
            "An error occurred while processing your request. Please try again later.",
          ephemeral: true,
        });
      }
    });
  },
};
