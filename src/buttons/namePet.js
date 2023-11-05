const { ButtonBuilder, ModalBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "namePet",
    description: "Button for naming the pet",
  },
  async execute(interaction, client, userDb) {
    const modal = new ModalBuilder().setTitle("Name Your Pet").addTextInput({
      label: "Pet Name",
      customId: "petNameInput",
      placeholder:
        "Enter your pet's name. Max 25 chars and no more than 2 spaces are permitted.",
    });

    await interaction.reply({ modals: [modal] });
  },
};
