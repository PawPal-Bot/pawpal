const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

function getRemainingTime(lastActionTime) {
  const oneHour = 3600000;
  const remainingTimeMs = lastActionTime + oneHour - Date.now();
  const remainingMinutes = Math.floor(remainingTimeMs / 60000);
  return remainingMinutes > 0
    ? `${remainingMinutes} minute(s)`
    : "less than a minute";
}

const now = new Date();
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
const baseHappinessIncrease = 5;
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
        (patTime) => patTime >= tenMinutesAgo
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
      const userDb = await userModel.findOne({ userId: interaction.user.id });

      if (!userDb || userDb.petType === 0) {
        await interaction.reply({
          content:
            "You don't have a pet to cuddle. Run </get started:1168885856032014448> to adopt one",
          ephemeral: true,
        });
        return;
      }

      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      const lastCuddledArray = userDb.actionTimestamps.lastCuddled;
      const lastCuddled =
        lastCuddledArray.length > 0
          ? lastCuddledArray[lastCuddledArray.length - 1]
          : null;

      if (lastCuddled && lastCuddled.getTime() >= thirtyMinutesAgo.getTime()) {
        await interaction.reply({
          content: `You have already cuddled ${petName} within the last 30 minutes. Please wait a bit before cuddling again.`,
          ephemeral: true,
        });
        return;
      }

      userDb.actionTimestamps.lastCuddled = now;

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
      const lastRan = userDb.actionTimestamps.lastRan;
      const oneHourAgo = Date.now() - 3600000; // Current time minus one hour in milliseconds

      if (lastRan && lastRan > oneHourAgo) {
        const timeRemaining = getRemainingTime(lastRan);
        const description = `${petName} is tired, you can take him for another run in ${timeRemaining}.`;
        return await interaction.reply(description);
      }
      const energyDecreasePercentage = Math.random() * 10 + 10;
      userDb.energy = Math.max(
        userDb.energy - userDb.energy * (energyDecreasePercentage / 100),
        0
      );

      userDb.energy = parseFloat(userDb.energy.toFixed(2));
      userDb.affection = parseFloat(userDb.affection.toFixed(2));

      userDb.affection =
        userDb.petType === 2
          ? Math.max(userDb.affection - 1, 0)
          : Math.min(userDb.affection + 1, 100);

      userDb.happiness =
        userDb.petType === 2
          ? Math.max(userDb.happiness - 2, 0)
          : Math.min(userDb.happiness + 2, 100);

      userDb.actionTimestamps.lastRan = Date.now();
      await userDb.save();

      const petName = userDb.petName || "Your pet";
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
      const lastWalked = userDb.actionTimestamps.lastWalked;
      const oneHourAgo = Date.now() - 3600000;

      if (lastWalked && lastWalked > oneHourAgo) {
        const timeRemaining = getRemainingTime(lastWalked);
        const description = `${petName} is tired, you can take him for another walk in ${timeRemaining}.`;
        return await interaction.reply(description);
      }

      const energyDecreasePercentage = Math.random() * 7 + 5;
      userDb.energy = Math.max(
        userDb.energy - userDb.energy * (energyDecreasePercentage / 100),
        0
      );

      userDb.affection =
        userDb.petType === 2
          ? Math.max(userDb.affection - 2, 0)
          : Math.min(userDb.affection + 2, 100);

      userDb.energy = parseFloat(userDb.energy.toFixed(2));
      userDb.affection = parseFloat(userDb.affection.toFixed(2));

      userDb.happiness =
        userDb.petType === 2
          ? Math.max(userDb.happiness - 2, 0)
          : Math.min(userDb.happiness + 2, 100);

      userDb.actionTimestamps.lastWalked = Date.now();
      await userDb.save();

      const petName = userDb.petName || "Your pet";
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
