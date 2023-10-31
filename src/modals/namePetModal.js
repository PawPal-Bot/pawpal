const userModel = require("../util/Models/userModel");

module.exports = {
  data: {
    name: "namePetModal",
    description: "Modal for naming the pet",
  },
  async execute(interaction, client, userDb) {
    // Ensure interaction.values exists before accessing it
    if (!interaction.values) {
      console.error("Interaction values are undefined.");
      return;
    }

    // Get the pet name from the modal submission
    const petName = interaction.values[0]; // Assuming only one input with name "petNameInput"

    // Validate the pet name
    if (!petName || petName.length > 25 || petName.split(" ").length > 3) {
      return interaction.reply({
        content:
          "Please provide a valid pet name. Max 25 chars and no more than 2 spaces are permitted.",
        ephemeral: true,
      });
    }

    // Update the user's pet name in the database
    try {
      await userModel
        .findOneAndUpdate(
          { userId: interaction.user.id },
          { petName: petName },
          { upsert: true }
        )
        .exec();

      // Reply with a confirmation message and care instructions
      const careInstructions = `
        1. Feed your pet twice a day.
        2. Take your pet for a walk at least once a day.
        3. Provide fresh water every day.
        4. Regular check-ups with the vet.
        5. ... and lots of love and cuddles!
      `;

      await interaction.reply({
        content: `Oh great, your little pet's name is ${petName}. That's gorgeous!\n**How to Care for Your Pet:**\n${careInstructions}`,
      });
    } catch (error) {
      console.error("Error updating pet name:", error);
      interaction.reply({
        content:
          "An error occurred while processing your request. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
