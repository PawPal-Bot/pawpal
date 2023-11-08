const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const { generateEmbeds, generateButtons } = require("../util/petUtils");
const variables = require("../data/variableNames");

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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("release")
        .setDescription("Release your pet back into the wild")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("adopt").setDescription("Adopt a new pet!")
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
        content: "You don't have a pet to look up. Run </get started:1168885856032014448>",
        ephemeral: true
      });
      return;
    }
    
    const embeds = generateEmbeds(userDb);
    await interaction.reply({
      embeds: [embeds[0]],
      components: [generateButtons(0, embeds.length)]
    });
    } else if (subcommand === "release") {
      const userDb = await userModel.findOne({ userId: interaction.user.id });

      if (!userDb || userDb.petType === 0) {
        await interaction.reply({
          content:
            "You don't have a pet to release. Run </get started:1168885856032014448> to adopt one",
          ephemeral: true,
        });
        return;
      }

      try {
        await userModel.findOneAndUpdate(
          { userId: interaction.user.id },
          {
            $set: {
              petName: "",
              petType: 0,
              hasPet: false,
              lifeStage: 0,
              age: 0,
              health: 100,
              isSick: false,
              medicineCount: 0,
              discipline: 0,
              trainingLevel: 0,
              happiness: 50,
              energy: 100,
              hunger: 50,
              thirst: 50,
              cleanliness: 50,
              exerciseLevel: 0,
              sleepLevel: 100,
              educationLevel: 0,
              affection: 50,
              miniGameScores: {},
              patCount: 0,
              feedCount: 0,
              drinkCount: 0,
              cleanedCount: 0,
              socialisation: {
                friends: [],
                competitionsEntered: 0,
              },
              accessories: [],
              housingCustomisations: [],
              actionTimeStamp: {
                lastFed: [],
                lastDrank: [],
                lastCleaned: [],
                lastMedicine: [],
                lastPlayed: [],
                lastEducated: [],
                lastWalked: [],
                lastPat: [],
              },
            },
          },
          { upsert: true }
        ).exec();

        await interaction.reply(
          "You have successfully released your pet back into the wild."
        );
      } catch (error) {
        console.error(error);
        await interaction.reply(
          "An error occurred while trying to release your pet. Please try again later."
        );
      }
    } else if (subcommand === "adopt") {
      const userId = interaction.user.id;
      try {
        userDb = await userModel.findOneAndUpdate(
          { userId },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec();
      } catch (error) {
        console.error("Create/Fetch User Error >", error);
        await interaction.reply({
          content:
            "An error occurred while processing your request. Please try again later.",
          ephemeral: true,
        });
        return;
      }

      if (userDb.hasPet) {
        const alreadyHavePetEmbed = new EmbedBuilder()
          .setTitle("You already have a pet!")
          .setDescription("You can't adopt another one!")
          .setColor("#ff0000");

        await interaction.reply({
          embeds: [alreadyHavePetEmbed],
        });
        return;
      }

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

      await interaction.reply({
        embeds: [startingEmbed],
        components: [new ActionRowBuilder().addComponents(selectMenu)],
      });
    }
  },
};

