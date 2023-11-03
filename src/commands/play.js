const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamp = require("../util/timeStamp");
const variables = require("../data/variableNames");

function getPetSounds(userDb) {
  const petTypeStrMap = {
    1: "dog",
    2: "cat",
    3: "redPanda",
  };

  const petTypeStr = petTypeStrMap[userDb.petType];
  if (!petTypeStr) {
    console.error("Invalid pet type:", userDb.petType);
    return null;
  }

  const randomPetSound =
    speechBubbles[petTypeStr][
      Math.floor(Math.random() * speechBubbles[petTypeStr].length)
    ];

  return { petTypeStr, randomPetSound };
}

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
    const userDb = await userModel.findOne({ userId: interaction.user.id });

    if (!userDb || userDb.petType === 0) {
      await interaction.reply("You don't have a pet to interact with!");
      return;
    }

    const petName = userDb.petName || "Your pet";
    const subcommand = interaction.options.getSubcommand();
    const now = Date.now();
    const { petTypeStr, randomPetSound } = getPetSounds(userDb);
    if (!petTypeStr) {
      await interaction.reply("There was an error with your pet type.");
      return;
    }

    switch (subcommand) {
      case "pat":
        await handlePat(interaction, userDb, petName, now, randomPetSound);
        break;
      case "cuddle":
        await handleCuddle(interaction, userDb, petName, now, randomPetSound);
        break;
      case "walk":
        await handleWalk(interaction, userDb, petName, now, randomPetSound);
        break;
      case "run":
        await handleRun(interaction, userDb, petName, now, randomPetSound);
        break;
    }
    await userDb.save();
  },
};

async function handlePat(interaction, userDb, petName, now, randomPetSound) {
  if (userDb.energy < 5) {
    await interaction.reply(
      `${randomPetSound}! ${petName} is too tired for pats right now.`
    );
    return;
  }

  const recentPats = userDb.actionTimestamps.lastPat.filter(
    (patTime) => new Date(patTime).getTime() > now - timeStamp.tenMinutes()
  );

  if (recentPats.length >= 3) {
    await interaction.reply(
      `${petName} has been patted too much recently. Try again later.`
    );
    return;
  }

  // Push the current timestamp to the lastPat array
  userDb.actionTimestamps.lastPat.push(now);
  // Keep only the last 5 timestamps
  if (userDb.actionTimestamps.lastPat.length > 5) {
    userDb.actionTimestamps.lastPat.shift();
  }

  // Calculate the new happiness level
  const happinessIncrease = Math.floor(Math.random() * 25) + 1;
  userDb.happiness = Math.min(userDb.happiness + happinessIncrease, 100);

  // Save the updated userDb
  await userDb.save();

  const patEmbed = new EmbedBuilder()
    .setColor("#9e38fe")
    .setTitle("Pat your pet!")
    .setDescription(`${randomPetSound}! ${petName} loves the attention.`)
    .setFooter({
      text: `Happiness: ${variables.getHappiness(userDb.happiness)}`,
    })
    .setTimestamp();

  const patButton = new ButtonBuilder()
    .setCustomId("pat")
    .setLabel("Pat")
    .setStyle("Primary");

  await interaction.reply({
    embeds: [patEmbed],
    components: [new ActionRowBuilder().addComponents(patButton)],
  });
}

async function handleCuddle(interaction, userDb, petName, now, randomPetSound) {
  // Retrieve the last cuddle timestamp from the database
  const lastCuddledArray = userDb.actionTimestamps.lastCuddled;
  const lastCuddled =
    lastCuddledArray.length > 0
      ? new Date(lastCuddledArray[lastCuddledArray.length - 1])
      : null;

  // Check if the pet has been cuddled in the last 30 minutes
  if (lastCuddled && now - lastCuddled.getTime() < timeStamp.thirtyMinutes()) {
    const timeRemaining =
      timeStamp.thirtyMinutes() - (now - lastCuddled.getTime());
    const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000)); // Convert milliseconds to minutes and round up
    await interaction.reply({
      content: `You've already cuddled ${petName} within the last 30 minutes. Please wait ${remainingMinutes} minute(s) before cuddling again.`,
    });
    return;
  }

  // Add the current timestamp to the lastCuddled array and remove the oldest if necessary
  userDb.actionTimestamps.lastCuddled.push(now);
  if (userDb.actionTimestamps.lastCuddled.length > 5) {
    userDb.actionTimestamps.lastCuddled.shift();
  }

  // Calculate the changes in affection and happiness
  const affectionIncrease = Math.random() * 0.5 + 0.2; // Random float between 0.2 and 0.7
  userDb.affection = Math.min(userDb.affection + affectionIncrease, 100);
  const happinessIncrease = Math.floor(Math.random() * 25) + 1;
  userDb.happiness = Math.min(userDb.happiness + happinessIncrease, 100);

  // Decrease energy due to cuddling
  const energyDecrease = Math.floor(Math.random() * 7) + 1; // Random integer between 1 and 7
  userDb.energy = Math.max(userDb.energy - energyDecrease, 0);

  // Save the updated userDb
  await userDb.save();

  const cuddleEmbed = new EmbedBuilder()
    .setColor("#9e38fe")
    .setTitle("Cuddle Time!")
    .setDescription(`You cuddled with ${petName}. It looks very happy!`)
    .addFields(
      {
        name: "Energy",
        value: `${variables.getEnergy(userDb.energy)}`,
        inline: true,
      },
      {
        name: "Affection",
        value: `${variables.getAffection(userDb.affection)}`,
        inline: true,
      },
      {
        name: "Happiness",
        value: `${variables.getHappiness(userDb.happiness)}`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [cuddleEmbed],
  });
}

async function handleWalk(interaction, userDb, petName, now, randomPetSound) {
  // Retrieve the last walked and ran timestamps
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

  // Check if the pet has been walked or ran in the last hour
  if (
    (lastWalked && now - lastWalked.getTime() < timeStamp.oneHour()) ||
    (lastRan && now - lastRan.getTime() < timeStamp.oneHour())
  ) {
    const timeRemaining = Math.max(
      lastWalked ? timeStamp.oneHour() - (now - lastWalked.getTime()) : 0,
      lastRan ? timeStamp.oneHour() - (now - lastRan.getTime()) : 0
    );
    const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
    await interaction.reply({
      content: `Please wait ${remainingMinutes} minute(s). ${petName} is still tired from the last activity.`,
    });
    return;
  }

  // Add the current timestamp to the lastWalked array
  userDb.actionTimestamps.lastWalked.push(now);
  if (userDb.actionTimestamps.lastWalked.length > 5) {
    userDb.actionTimestamps.lastWalked.shift();
  }

  // Calculate the changes in energy, affection, and happiness
  const energyDecreasePercentage = Math.random() * 7 + 5;
  userDb.energy = Math.max(
    userDb.energy - userDb.energy * (energyDecreasePercentage / 100),
    0
  );

  const affectionIncrease = userDb.petType === 2 ? -2 : 2;
  userDb.affection = Math.max(
    Math.min(userDb.affection + affectionIncrease, 100),
    0
  );

  const happinessIncrease = userDb.petType === 2 ? -2 : 2;
  userDb.happiness = Math.max(
    Math.min(userDb.happiness + happinessIncrease, 100),
    0
  );

  // Save the updated userDb
  await userDb.save();

  const walkEmbed = new EmbedBuilder()
    .setColor("#9e38fe")
    .setTitle(`${petName} went for a walk!`)
    .setDescription(
      `It was refreshing and enjoyable. ${petName} is looking happier!`
    )
    .addFields(
      {
        name: "Energy",
        value: `${variables.getEnergy(userDb.energy)}`,
        inline: true,
      },
      {
        name: "Affection",
        value: `${variables.getAffection(userDb.affection)}`,
        inline: true,
      },
      {
        name: "Happiness",
        value: `${variables.getHappiness(userDb.happiness)}`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [walkEmbed],
  });
}

async function handleRun(interaction, userDb, petName, now, randomPetSound) {
  // Retrieve the last walked and ran timestamps
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

  // Check if the pet has been walked or ran in the last hour
  if (
    (lastWalked && now - lastWalked.getTime() < timeStamp.oneHour()) ||
    (lastRan && now - lastRan.getTime() < timeStamp.oneHour())
  ) {
    const timeRemaining = Math.max(
      lastWalked ? timeStamp.oneHour() - (now - lastWalked.getTime()) : 0,
      lastRan ? timeStamp.oneHour() - (now - lastRan.getTime()) : 0
    );
    const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
    await interaction.reply({
      content: `Please wait ${remainingMinutes} minute(s). ${petName} is still recovering from the last activity.`,
    });
    return;
  }

  // Add the current timestamp to the lastRan array
  userDb.actionTimestamps.lastRan.push(now);
  if (userDb.actionTimestamps.lastRan.length > 5) {
    userDb.actionTimestamps.lastRan.shift();
  }

  const energyDecreasePercentage = Math.random() * 10 + 15;
  userDb.energy = Math.max(
    userDb.energy - userDb.energy * (energyDecreasePercentage / 100),
    0
  );

  const affectionChange = userDb.petType === 2 ? -1 : 1;
  userDb.affection = Math.max(
    Math.min(userDb.affection + affectionChange, 100),
    0
  );

  const happinessChange = userDb.petType === 2 ? -2 : 2;
  userDb.happiness = Math.max(
    Math.min(userDb.happiness + happinessChange, 100),
    0
  );

  // Save the updated userDb
  await userDb.save();

  const runEmbed = new EmbedBuilder()
    .setColor("#9e38fe")
    .setTitle(`${petName} went for a run!`)
    .setDescription(
      `${randomPetSound}! That was intense! ${petName} is now quite tired but feeling accomplished.`
    )
    .addFields(
      {
        name: "Energy",
        value: `${variables.getEnergy(userDb.energy)}`,
        inline: true,
      },
      {
        name: "Affection",
        value: `${variables.getAffection(userDb.affection)}`,
        inline: true,
      },
      {
        name: "Happiness",
        value: `${variables.getHappiness(userDb.happiness)}`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [runEmbed],
  });
}
