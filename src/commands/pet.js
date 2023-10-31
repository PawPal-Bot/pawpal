const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../util/Models/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pet")
    .setDescription("Manage your pet!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("name")
        .setDescription("Set your pet's name")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The new name for your pet")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("about")
        .setDescription("Get detailed information about your pet")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "name") {
      const userDb = await userModel.findOne({ userId: interaction.user.id });

      if (!userDb || userDb.petType === 0) {
        await interaction.reply({
          content: "You don't have a pet to name!",
          ephemeral: true,
        });
        return;
      }

      const newName = interaction.options.getString("name").trim();

      if (newName.length > 25) {
        await interaction.reply({
          content: `\`${newName}\` is too long, your pet's name should be no more than 25 characters.`,
          ephemeral: true,
        });
        return;
      }

      if ((newName.match(/\s/g) || []).length > 2) {
        await interaction.reply({
          content: `\`${newName}\` contains more than two spaces. Please choose a different name.`,
          ephemeral: true,
        });
        return;
      }

      userDb.petName = newName;
      await userDb.save();

      await interaction.reply(`Your pet's name has been set to ${newName}!`);
    } else if (subcommand === "about") {
      const userDb = await userModel.findOne({ userId: interaction.user.id });

      if (!userDb || userDb.petType === 0) {
        await interaction.reply({
          content: "You don't have a pet to name!",
          ephemeral: true,
        });
        return;
      }

      const petName = userDb.petName || "Your pet";

      const fieldsArray = [
        {
          name: "🪧 Name",
          value: userDb.petName || "You haven't chosen a name",
          inline: true,
        },
        {
          name: ["Type", "🦴 Type", "🐠 Type", "🎍 Type"][userDb.petType],
          value: ["❌ None", "Dog", "Cat", "Red Panda"][userDb.petType],
          inline: true,
        },
        { name: "👶 Age", value: userDb.petAge.toString(), inline: true },
        {
          name: "❤️ Happiness",
          value: `${userDb.petHappiness}/100`,
          inline: true,
        },
        { name: "🍔 Hungriness", value: `${userDb.petHunger}/100`, inline: true },
        {
          name: "🛁 Cleanliness",
          value: `${userDb.petCleanliness}/100`,
          inline: true,
        },
        { name: "🖐️ Times Pat", value: userDb.patCount.toString(), inline: true },
        {
          name: "⏰ Last Pat",
          value:
            userDb.patTimestamps.length > 0
              ? `<t:${Math.floor(userDb.patTimestamps.slice(-1)[0] / 1000)}:R>`
              : "Never",
          inline: true,
        },
        {
          name: "🥄 Times Fed",
          value: userDb.feedCount.toString(),
          inline: true,
        },
        {
          name: "⏰ Last Fed",
          value:
            userDb.feedTimestamps.length > 0
              ? `<t:${Math.floor(userDb.feedTimestamps.slice(-1)[0] / 1000)}:R>`
              : "Never",
          inline: true,
        },
      ];

      const petInfoEmbed = new EmbedBuilder()
        .setTitle(`${petName}'s Information`)
        .addFields(fieldsArray)
        .setColor("#9e38fe");

      await interaction.reply({ embeds: [petInfoEmbed] });
    }
  },
};
