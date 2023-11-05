const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
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
        {
          name: "❤️ Health",
          value: `${variables.getHealth(userDb.health)}`,
          inline: true,
        },
        {
          name: "🍔 Hunger",
          value: `${variables.getHunger(userDb.hunger)}`,
          inline: true,
        },
        {
          name: "💧 Thirst",
          value: `${variables.getThirst(userDb.thirst)}`,
          inline: true,
        },
        {
          name: "🏃🏾‍♂️ Energy Level",
          value: `${variables.getEnergy(userDb.energy)}`,
          inline: true,
        },
        {
          name: "💕 Affection",
          value: `${variables.getAffection(userDb.affection)}`,
          inline: true,
        },
        {
          name: "❤️ Happiness",
          value: `${variables.getHappiness(userDb.happiness)}`,
          inline: true,
        },
        {
          name: "😷 Is Sick?",
          value: userDb.isSick ? "Yes" : "No",
          inline: true,
        },
        {
          name: "🎓 Education Level",
          value: `${variables.getEducation(userDb.educationLevel)}`,
          inline: true,
        },
        {
          name: "🛁 Cleanliness",
          value: `${variables.getCleanliness(userDb.cleanliness)}`,
          inline: true,
        },
        {
          name: "🏃 Exercise Level",
          value: `${variables.getExercise(userDb.exerciseLevel)}`,
          inline: true,
        },
        {
          name: "💤 Sleep Level",
          value: `${variables.getSleep(userDb.sleepLevel)}`,
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
          name: "🥄 Times Fed",
          value: userDb.feedCount.toString(),
          inline: true,
        },
        {
          name: "💦 Times Drank",
          value: userDb.drinkCount.toString(),
          inline: true,
        },
        {
          name: "⏰ Last Pat",
          value:
            userDb.actionTimeStamp.lastPat.length > 0
              ? `<t:${Math.floor(
                  userDb.actionTimeStamp.lastPat.slice(-1)[0].getTime() / 1000
                )}:R>`
              : "Never",
          inline: true,
        },
        {
          name: "⏰ Last Fed",
          value:
            userDb.actionTimeStamp.lastFed.length > 0
              ? `<t:${Math.floor(
                  userDb.actionTimeStamp.lastFed.slice(-1)[0].getTime() / 1000
                )}:R>`
              : "Never",
          inline: true,
        },
        {
          name: "⏰ Last Drank",
          value:
            userDb.actionTimeStamp.lastDrank.length > 0
              ? `<t:${Math.floor(
                  userDb.actionTimeStamp.lastDrank.slice(-1)[0].getTime() / 1000
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
          name: "⏰ Last Cleaned or Groomed",
          value: (() => {
            const lastCleanedTimestamp =
              userDb.actionTimeStamp.lastCleaned.length > 0
                ? new Date(
                    userDb.actionTimeStamp.lastCleaned.slice(-1)[0]
                  ).getTime()
                : 0;
            const lastGroomedTimestamp =
              userDb.actionTimeStamp.lastGroomed.length > 0
                ? new Date(
                    userDb.actionTimeStamp.lastGroomed.slice(-1)[0]
                  ).getTime()
                : 0;

            const mostRecentTimestamp = Math.max(
              lastCleanedTimestamp,
              lastGroomedTimestamp
            );

            if (mostRecentTimestamp === 0) {
              return "Never";
            }

            return `<t:${Math.floor(mostRecentTimestamp / 1000)}:R>`;
          })(),
          inline: true,
        },
      ];
      const fieldsArray = [
        { name: "Basic Info", value: "\u200B", inline: false },
        ...basicInfoFields,

        { name: "Health & Needs", value: "\u200B", inline: false },
        ...healthNeedsFields,

        { name: "Interactions", value: "\u200B", inline: false },
        ...interactionsFields,
      ];

      const baseImageUrl = "https://fjord.au/assets/pawpal";
      const petTypeFolder =
        userDb.petType === 1
          ? "dog"
          : userDb.petType === 2
          ? "cat"
          : "redpanda";
      let emotionSuffix;

      if (userDb.happiness < 30) {
        emotionSuffix = "A"; // Angry
      } else if (userDb.happiness <= 60) {
        emotionSuffix = "N"; // Neutral
      } else {
        emotionSuffix = "H"; // Happy
      }

      const imageUrl = `${baseImageUrl}/${petTypeFolder}/${petTypeFolder}${emotionSuffix}.png`;

      const petInfoEmbed = new EmbedBuilder()
        .setThumbnail(imageUrl)
        .setAuthor({
          name: petName + "'s Information",
          iconURL: imageUrl,
        })
        .addFields(fieldsArray)
        .setColor("#9e38fe")
        .setFooter({
          text: `Pet information for ${interaction.user.username} | PawPal`,
        });

      await interaction.reply({ embeds: [petInfoEmbed] });
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
        await userModel
          .findOneAndUpdate(
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
          )
          .exec();

        await interaction.reply(
          "You have successfully released your pet back into the wild."
        );
      } catch (error) {
        console.error(error);
        await interaction.reply(
          "An error occurred while trying to release your pet. Please try again later."
        );
      }
    }
    if (subcommand === "adopt") {
      const userId = interaction.user.id;

      try {
        userDb = await userModel
          .findOneAndUpdate(
            { userId },
            {},
            { upsert: true, new: true, setDefaultsOnInsert: true }
          )
          .exec();
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
