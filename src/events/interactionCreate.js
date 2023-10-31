const userModel = require("../util/Models/userModel.js");

module.exports = async (client, interaction) => {
  try {
    const userDb = await client.database.getUser(interaction.user.id, true);
    const result = await userModel.findOne({ userId: interaction.user.id });
    if (!result) {
      await userModel.create({
        userId: interaction.user.id,
      });
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) {
        await command.execute(interaction, client, userDb);
      }
    } else if (interaction.isButton()) {
      if (interaction.message.interaction.user.id !== interaction.user.id) {
        return interaction.reply({
          content: `This button does not belong to you it belongs to ${interaction.message.interaction.user.username}`,
          ephemeral: true,
        });
      }
      const button = client.buttons.get(interaction.customId);
      if (button) {
        await button.execute(interaction, client, userDb);
      }
    } else if (interaction.isStringSelectMenu()) {
      const selectMenu = client.selectMenus.get(interaction.customId);
      if (selectMenu) {
        await selectMenu.execute(interaction, client, userDb);
      }
    } else {
      if (interaction.message.interaction.user.id !== interaction.user.id) {
        return interaction.reply({
          content: `This interaction does not belong to you it belongs to ${interaction.message.interaction.user.username}`,
          ephemeral: true,
        });
      } else if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);
        if (modal) {
          await modal.execute(interaction, client, userDb);
        }
      }
    }
  } catch (err) {
    console.error(err);
    interaction.reply({
      content: "An error occurred while executing that action.",
      ephemeral: true,
    });
  }
};
