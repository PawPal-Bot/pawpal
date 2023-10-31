const userModel = require("../util/Models/userModel.js");

module.exports = async (client, interaction) => {
  const userDb = await client.database.getUser(interaction.user.id, true);
  userModel.findOne({ userId: interaction.user.id }).then(async (result) => {
    if (!result) {
      await userModel.create({
        userId: interaction.user.id,
      });
    }
  });

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      command.execute(interaction, client, userDb);
    } catch (err) {
      if (err) console.error(err);
      interaction.reply({
        content: "An error occurred while executing that command.",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    if (interaction.message.interaction.user.id !== interaction.user.id)
      return interaction.reply({
        content:
          "This button does not belong to you it belongs to " +
          interaction.message.interaction.user.username,
        ephemeral: true,
      });
    const button = client.buttons.get(interaction.customId);
    try {
      button.execute(interaction, client, userDb);
    } catch (err) {
      if (err) console.error(err);
      interaction.reply({
        content: "An error occurred while trying to execute this button.",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    if (interaction.message.interaction.user.id !== interaction.user.id)
      return interaction.reply({
        content:
          "This button does not belong to you it belongs to " +
          interaction.message.interaction.user.username,
        ephemeral: true,
      });
    const button = client.buttons.get(interaction.customId);
    try {
      button.execute(interaction, client, userDb);
    } catch (err) {
      if (err) console.error(err);
      interaction.reply({
        content: "An error occurred while trying to execute this button.",
        ephemeral: true,
      });
    }
  }
};
