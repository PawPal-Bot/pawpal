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
          content:
            "You don't have a pet to name. Run </get started:1168885856032014448> to adopt one",
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
          content:
            "You don't have a pet to look up. Run </get started:1168885856032014448>",
          ephemeral: true,
        });
        return;
      }

      const petName = userDb.petName || "Your pet";

      // Basic Info
      const basicInfoFields = [
        {
          name: "🪧 Pet Name",
          value: userDb.petName || "You haven't chosen a name",
          inline: true,
        },
        {
          name: ["Type", "🦴 Type", "🐠 Type", "🎍 Type"][userDb.petType],
          value: ["❌ None", "Dog", "Cat", "Red Panda"][userDb.petType],
          inline: true,
        },
        {
          name: "👶 Life Stage & Age",
          value: `${
            ["Baby", "Child", "Teen", "Adult"][userDb.lifeStage]
          }, aged ${userDb.age}`,
          inline: true,
        },
      ];

      // Health & Needs
      const healthNeedsFields = [
        { name: "❤️ Health", value: `${userDb.health}/100`, inline: true },
        { name: "🍔 Hunger", value: `${userDb.hunger}/100`, inline: true },
        { name: "💧 Thirst", value: `${userDb.thirst}/100`, inline: true },
        {
          name: "🏃🏾‍♂️ Energy Level",
          value: userDb.energy.toString(),
          inline: true,
        },
        {
          name: "💕 Affection",
          value: `${userDb.affection}/100`,
          inline: true,
        },
        {
          name: "❤️ Happiness",
          value: `${userDb.happiness}/100`,
          inline: true,
        },
        {
          name: "😷 Is Sick?",
          value: userDb.isSick ? "Yes" : "No",
          inline: true,
        },
        {
          name: "🎓 Education Level",
          value: userDb.educationLevel.toString(),
          inline: true,
        },
        {
          name: "🛁 Cleanliness",
          value: `${userDb.cleanliness}/100`,
          inline: true,
        },
        {
          name: "🏃 Exercise Level",
          value: userDb.exerciseLevel.toString(),
          inline: true,
        },
        {
          name: "💤 Sleep Level",
          value: `${userDb.sleepLevel}/100`,
          inline: true,
        },
      ];

      // Interactions
      const interactionsFields = [
        {
          name: "🖐️ Times Pat",
          value: userDb.patCount.toString(),
          inline: true,
        },
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
        {
          name: "💦 Times Drank",
          value: userDb.drinkCount.toString(),
          inline: true,
        },
        {
          name: "⏰ Last Drank",
          value:
            userDb.drinkTimestamps.length > 0
              ? `<t:${Math.floor(
                  userDb.drinkTimestamps.slice(-1)[0] / 1000
                )}:R>`
              : "Never",
          inline: true,
        },
        {
          name: "🛁 Times Cleaned",
          value: userDb.cleanedCount.toString(),
          inline: true,
        },
        {
          name: "⏰ Last Cleaned",
          value:
            userDb.cleanedTimestamps.length > 0
              ? `<t:${Math.floor(
                  userDb.cleanedTimestamps.slice(-1)[0] / 1000
                )}:R>`
              : "Never",
          inline: true,
        },
      ];

      // Combine all fields into a single array
      const fieldsArray = [
        { name: "Basic Info", value: "\u200B", inline: false },
        ...basicInfoFields,

        { name: "Health & Needs", value: "\u200B", inline: false },
        ...healthNeedsFields,

        { name: "Interactions", value: "\u200B", inline: false },
        ...interactionsFields,
      ];

      const petInfoEmbed = new EmbedBuilder()
        .setTitle(`${petName}'s Information`)
        .addFields(fieldsArray)
        .setColor("#9e38fe");

      await interaction.reply({ embeds: [petInfoEmbed] });
    }
  },
};
