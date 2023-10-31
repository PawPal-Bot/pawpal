const {
  ActionRowBuilder,
  ChannelType,
  ChannelSelectMenuBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
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

    await userModel
      .findOneAndUpdate(
        { userId: interaction.user.id },
        { petType: interaction.values[0], hasPet: true },
        { upsert: true }
      )
      .exec();

    const updatedEmbed = new EmbedBuilder()
      .setTitle("Congratulations!")
      .setDescription("You've adopted a " + petMap[interaction.values[0]] + "!")
      .setColor("#9e38fe");

    await interaction.update({
      embeds: [updatedEmbed],
      components: [],
    });
  },
};
