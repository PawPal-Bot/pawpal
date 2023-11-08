const userModel = require("../util/Models/userModel.js");

module.exports = async (client, interaction) => {
  const userDb = await client.database.getUser(interaction.user.id, true);

  let result = await userModel.findOne({ userId: interaction.user.id });
  if (!result) {
    await userModel.create({ userId: interaction.user.id });
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error("Command not found:", interaction.commandName);
      return;
    }
    try {
      command.execute(interaction, client, userDb);
    } catch (err) {
      console.error("Error executing command:", err);
      interaction.reply({
        content: "An error occurred while executing that command.",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
  if (interaction.message.interaction.user.id !== interaction.user.id) {
    console.error("Button does not belong to the user.");
    return interaction.reply({
      content:
        "This button does not belong to you; it belongs to " +
        interaction.message.interaction.user.username,
      ephemeral: true,
    });
  }
  
  // Extract the base name of the button logic to handle dynamic indices
  const baseButtonName = interaction.customId.replace(/_[0-9]+$/, '');
  const button = client.buttons.get(baseButtonName);

  if (!button) {
    console.error("Button not found:", baseButtonName);
    return interaction.reply({
      content: "An error occurred while trying to execute this button.",
      ephemeral: true,
    });
  }
  try {
    button.execute(interaction, client, userDb);
  } catch (err) {
    console.error("Error executing button:", err);
    interaction.reply({
      content: "An error occurred while trying to execute this button.",
      ephemeral: true,
    });
  }
} else {
    console.error("Unknown interaction type:", interaction.type);
  }
};
