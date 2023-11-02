const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamp = require("../util/timeStamp");

function getRemainingTime(lastActionTime) {
  const remainingTimeMs = lastActionTime + 3600000 - Date.now();
  const remainingMinutes = Math.floor(remainingTimeMs / 60000);
  return remainingMinutes > 0
    ? `${remainingMinutes} minute(s)`
    : "less than a minute";
}

const happinessIncrease = Math.floor(Math.random() * 25) + 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Interact with your pet!")
    .addSubcommand((subcommand) =>
      subcommand.setName("pat").setDescription("Pat your pet to show affection")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cuddle")
        .setDescription("Cuddle with your pet to increase bonding")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("walk").setDescription("Take your pet for a walk")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("run").setDescription("Take your pet for a run")
    ),
  async execute(interaction) {
    const userDb = await userModel.findOne({
      userId: interaction.user.id,
    });

    const affectionIncrease = Math.random() * 0.5 + 0.2; // Random float between 0.2 and 0.7
    userDb.affection = Math.min(userDb.affection + affectionIncrease, 100);
    const energyDecrease = Math.floor(Math.random() * 7) + 1; // Random integer between 1 and 7
    userDb.energy = Math.max(userDb.energy - energyDecrease, 0);
    const petName = userDb.petName || "Your pet";

    userDb.happiness =
      userDb.petType === 2
        ? Math.max(userDb.happiness + 4, 100)
        : Math.min(userDb.happiness + 2, 100);

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "pat") {
      await interaction.deferReply();

      if (!userDb || userDb.petType === 0) {
        await interaction.editReply("You don't have a pet to pat!");
        return;
      }

      if (userDb.happiness >= 100) {
        await interaction.editReply("Your pet can't get any happier!");
        return;
      }

      const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
      const randomSound =
        speechBubbles[petTypeStr][
          Math.floor(Math.random() * speechBubbles[petTypeStr].length)
        ];

      if (
        !userDb.actionTimestamps.lastPat ||
        !Array.isArray(userDb.actionTimestamps.lastPat)
      ) {
        userDb.actionTimestamps.lastPat = [];
      }
      userDb.actionTimestamps.lastPat.push(new Date());
      userDb.actionTimestamps.lastPat =
        userDb.actionTimestamps.lastPat.slice(-5);

      userDb.patCount += 1;

      await userDb.save();

      const recentPats = (userDb.actionTimestamps.lastPat || []).filter(
        (patTime) => patTime >= timeStamp.tenMinutesAgo
      );

      if (userDb.energy < 5) {
        const lowEnergyEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Low Energy")
          .setDescription(`${petName} is too tired for pats right now.`)
          .setTimestamp();

        await interaction.editReply({
          embeds: [lowEnergyEmbed],
          components: [],
        });
        return;
      }

      if (recentPats.length >= 3) {
        const tooManyPatsEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Too Many Pats")
          .setDescription(
            `${petName} has been patted too much recently. Try again later.`
          )
          .setTimestamp();

        await interaction.editReply({
          embeds: [tooManyPatsEmbed],
          components: [],
        });
        return;
      }

      const patEmbed = new EmbedBuilder()
        .setColor("#9e38fe")
        .setTitle("Pat your pet!")
        .setDescription(`${randomSound}! Give your pet some love.`)
        .setFooter({ text: `Happiness: ${userDb.happiness}/100` })
        .setTimestamp();

      const patButton = new ButtonBuilder()
        .setCustomId("pat")
        .setLabel("Pat")
        .setStyle("Primary");

      await interaction.editReply({
        embeds: [patEmbed],
        components: [new ActionRowBuilder().addComponents(patButton)],
      });
    } else if (subcommand === "cuddle") {
      const lastCuddledArray = userDb.actionTimestamps.lastCuddled;
      const lastCuddled =
        lastCuddledArray.length > 0
          ? lastCuddledArray[lastCuddledArray.length - 1]
          : null;

      if (
        lastCuddled &&
        lastCuddled.getTime() >= timeStamp.thirtyMinutesAgo()
      ) {
        const timeRemainingMs =
          lastCuddled.getTime() + timeStamp.thirtyMinutes() - Date.now();
        const remainingMinutes = Math.ceil(timeRemainingMs / (60 * 1000)); // Convert milliseconds to minutes and round up
        await interaction.reply({
          content: `You've already cuddled ${petName} within the last 30 minutes. Please wait ${remainingMinutes} minute(s) before cuddling again.`,
        });
        return;
      }

      userDb.actionTimestamps.lastCuddled = Date.now();

      userDb.happiness = Math.min(userDb.happiness + happinessIncrease, 100);
      userDb.affection = parseFloat(
        (userDb.affection + affectionIncrease).toFixed(2)
      );
      userDb.energy = Math.max(userDb.energy - energyDecrease, 0);

      await userDb.save();

      const cuddleEmbed = new EmbedBuilder()
        .setTitle("Cuddle Time!")
        .setDescription(`You cuddled with ${petName}`)
        .addFields(
          { name: "Energy", value: `${userDb.energy}`, inline: true },
          { name: "Affection", value: `${userDb.affection}`, inline: true },
          { name: "Happiness", value: `${userDb.happiness}`, inline: true }
        )
        .setColor("#9e38fe");

      await interaction.reply({ embeds: [cuddleEmbed] });
    } else if (subcommand === "run") {
      const lastWalkedArray = userDb.actionTimestamps.lastWalked;
      const lastWalked =
        lastWalkedArray.length > 0
          ? new Date(lastWalkedArray[lastWalkedArray.length - 1])
          : null;

      const lastRanArray = userDb.actionTimestamps.lastRan;
      const lastRan =
        lastRanArray.length > 0
          ? new Date(lastRanArray[lastRanArray.length - 1])
          : null;

      const oneHourAgo = Date.now() - timeStamp.oneHour();

      if (
        (lastWalked && lastWalked.getTime() > oneHourAgo) ||
        (lastRan && lastRan.getTime() > oneHourAgo)
      ) {
        const timeRemaining = Math.max(
          lastWalked
            ? lastWalked.getTime() + timeStamp.oneHour() - Date.now()
            : 0,
          lastRan ? lastRan.getTime() + timeStamp.oneHour() - Date.now() : 0
        );
        const remainingMinutes = Math.floor(timeRemaining / (60 * 1000));

        const lastActivity = !lastWalked
          ? "run"
          : !lastRan
          ? "walk"
          : lastWalked.getTime() > lastRan.getTime()
          ? "walk"
          : "run";

        const description = `${petName} is tired from your ${lastActivity}, you can take him for a run in ${remainingMinutes} minute(s).`;
        return await interaction.reply(description);
      }

      userDb.exerciseLevel = Math.min(
        userDb.exerciseLevel + Math.floor(Math.random() * 4) + 1,
        250
      );

      const baseEnergyDecreasePercentage = Math.random() * 10 + 10;
      const adjustedEnergyDecreasePercentage =
        baseEnergyDecreasePercentage * (1 - userDb.exerciseLevel / 250);
      userDb.energy = Math.max(
        userDb.energy -
          userDb.energy * (adjustedEnergyDecreasePercentage / 100),
        0
      );

      userDb.energy = parseFloat(userDb.energy.toFixed(2));
      userDb.affection = parseFloat(userDb.affection.toFixed(2));

      userDb.affection =
        userDb.petType === 2
          ? Math.max(userDb.affection - 1, 0)
          : Math.min(userDb.affection + 1, 100);

      const baseHappinessIncrease = userDb.petType === 2 ? -2 : 2;
      const adjustedHappinessIncrease =
        baseHappinessIncrease * (1 + userDb.exerciseLevel / 250);
      userDb.happiness = Math.min(
        userDb.happiness + adjustedHappinessIncrease,
        100
      );

      userDb.actionTimestamps.lastRan = Date.now();
      await userDb.save();

      let description = `${petName} had a great run! They are now a bit tired, but they enjoyed spending time with you.`;

      if (userDb.petType === 2) {
        description = `${petName} really didn't enjoy that run, they are now very tired and don't like you as much. Cats prefer a slower pace.`;
      }

      const runEmbed = new EmbedBuilder()
        .setTitle(`${petName} went for a run!`)
        .setDescription(description)
        .addFields(
          { name: "Energy", value: `${userDb.energy}`, inline: true },
          { name: "Affection", value: `${userDb.affection}`, inline: true },
          { name: "Happiness", value: `${userDb.happiness}`, inline: true }
        )
        .setColor("#9e38fe");

      await interaction.reply({ embeds: [runEmbed] });
    } else if (subcommand === "walk") {
      const lastWalkedArray = userDb.actionTimestamps.lastWalked;
      const lastWalked =
        lastWalkedArray.length > 0
          ? new Date(lastWalkedArray[lastWalkedArray.length - 1])
          : null;

      const lastRanArray = userDb.actionTimestamps.lastRan;
      const lastRan =
        lastRanArray.length > 0
          ? new Date(lastRanArray[lastRanArray.length - 1])
          : null;

      const oneHourAgo = Date.now() - timeStamp.oneHour();

      if (
        (lastWalked && lastWalked.getTime() > oneHourAgo) ||
        (lastRan && lastRan.getTime() > oneHourAgo)
      ) {
        const timeRemaining = Math.max(
          lastWalked
            ? lastWalked.getTime() + timeStamp.oneHour() - Date.now()
            : 0,
          lastRan ? lastRan.getTime() + timeStamp.oneHour() - Date.now() : 0
        );
        const remainingMinutes = Math.floor(timeRemaining / (60 * 1000));

        const lastActivity = !lastWalked
          ? "run"
          : !lastRan
          ? "walk"
          : lastWalked.getTime() > lastRan.getTime()
          ? "walk"
          : "run";

        const description = `${petName} is tired from your ${lastActivity}, you can take him for a walk in ${remainingMinutes} minute(s).`;
        return await interaction.reply(description);
      }

      userDb.exerciseLevel = Math.min(
        userDb.exerciseLevel + Math.floor(Math.random() * 4) + 1,
        250
      );

      const baseEnergyDecreasePercentage = Math.random() * 7 + 5;
      const adjustedEnergyDecreasePercentage =
        baseEnergyDecreasePercentage * (1 - userDb.exerciseLevel / 250);
      userDb.energy = Math.max(
        userDb.energy -
          userDb.energy * (adjustedEnergyDecreasePercentage / 100),
        0
      );

      userDb.affection =
        userDb.petType === 2
          ? Math.max(userDb.affection - 2, 0)
          : Math.min(userDb.affection + 2, 100);

      userDb.energy = parseFloat(userDb.energy.toFixed(2));
      userDb.affection = parseFloat(userDb.affection.toFixed(2));

      const baseHappinessIncrease = userDb.petType === 2 ? -2 : 2;
      const adjustedHappinessIncrease =
        baseHappinessIncrease * (1 + userDb.exerciseLevel / 250);
      userDb.happiness = Math.min(
        userDb.happiness + adjustedHappinessIncrease,
        100
      );

      userDb.actionTimestamps.lastWalked = Date.now();
      await userDb.save();

      let description = `${petName} enjoyed a pleasant walk with you. They are now a bit tired, but their affection for you has increased.`;

      if (userDb.petType === 2) {
        description = `${petName} wasn't thrilled about the walk, but they are now very tired and don't like you as much. Cats are very independent creatures.`;
      }

      const walkEmbed = new EmbedBuilder()
        .setTitle(`${petName} went for a walk!`)
        .setDescription(description)
        .addFields(
          { name: "Energy", value: `${userDb.energy}`, inline: true },
          { name: "Affection", value: `${userDb.affection}`, inline: true },
          { name: "Happiness", value: `${userDb.happiness}`, inline: true }
        )
        .setColor("#9e38fe");

      await interaction.reply({ embeds: [walkEmbed] });
    }
  },
};
