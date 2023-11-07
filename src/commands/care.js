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
const checkPetStatus = require("../util/eventChecks");

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
    .setName("care")
    .setDescription("Care for your pet!")
    .addSubcommand((subcommand) =>
      subcommand.setName("clean").setDescription("Clean your pet")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("groom").setDescription("Groom your pet")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("feed").setDescription("Feed your pet")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sleep")
        .setDescription("Put your pet to sleep for a while")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("vet")
        .setDescription("Take your pet to the vet for a checkup")
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

    const canContinue = await checkPetStatus(interaction, userDb, petName, now);
    if (!canContinue) {
      return;
    }

    switch (subcommand) {
      case "clean":
        await handleClean(interaction, userDb, petName, now, randomPetSound);
        break;
      case "groom":
        await handleGroom(interaction, userDb, petName, now, randomPetSound);
        break;
      case "feed":
        await handleFeed(interaction, userDb, petName, now, randomPetSound);
        break;
      case "sleep":
        await handleSleep(interaction, userDb, petName, now, randomPetSound);
        break;
      case "vet":
        await handleVet(interaction, userDb, petName, now, randomPetSound);
        break;
    }
    await userDb.save();
  },
};

async function handleClean(interaction, userDb, petName, now, randomPetSound) {
  if (!userDb.actionTimeStamp) userDb.actionTimeStamp = {};
  if (!userDb.actionTimeStamp.lastCleaned)
    userDb.actionTimeStamp.lastCleaned = [];

  if (typeof userDb.cleanedCount === "undefined") {
    userDb.cleanedCount = 0;
  }

  const lastCleanedTime =
    userDb.actionTimeStamp.lastCleaned.length > 0
      ? new Date(userDb.actionTimeStamp.lastCleaned.slice(-1)[0]).getTime()
      : 0;
  const lastGroomedTime =
    userDb.actionTimeStamp.lastGroomed.length > 0
      ? new Date(userDb.actionTimeStamp.lastGroomed.slice(-1)[0]).getTime()
      : 0;

  if (
    now - lastCleanedTime < timeStamp.twelveHours() ||
    now - lastGroomedTime < timeStamp.twelveHours()
  ) {
    const timeToNextAllowedClean = Math.max(
      timeStamp.twelveHours() - (now - lastCleanedTime),
      timeStamp.twelveHours() - (now - lastGroomedTime)
    );
    const remainingHours = Math.floor(
      timeToNextAllowedClean / (60 * 60 * 1000)
    );
    const remainingMinutes = Math.floor(
      (timeToNextAllowedClean % (60 * 60 * 1000)) / (60 * 1000)
    );

    const embed = new EmbedBuilder()
      .setColor("#FFA07A")
      .setTitle("Cleaning Too Soon!")
      .setDescription(
        `${petName} was cleaned or groomed quite recently. Please wait ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before cleaning again.`
      );

    await interaction.reply({ embeds: [embed] });
    return;
  }

  const cleanlinessIncrease = Math.floor(Math.random() * 16) + 5; // 5 to 20
  userDb.cleanliness = Math.min(100, userDb.cleanliness + cleanlinessIncrease);

  let happinessIncrease = cleanlinessIncrease * 0.25;
  if (cleanlinessIncrease >= 15) {
    happinessIncrease += 10;
  }
  userDb.happiness = Math.min(100, userDb.happiness + happinessIncrease);

  userDb.actionTimeStamp.lastCleaned.push(new Date(now).toISOString());

  while (userDb.actionTimeStamp.lastCleaned.length > 3) {
    userDb.actionTimeStamp.lastCleaned.shift();
  }

  userDb.cleanedCount += 1;

  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor("#ADD8E6")
    .setTitle("Cleaning Successful!")
    .setDescription(`${randomPetSound} ${petName} is looking fresh and clean.`)
    .addFields(
      { name: "Cleanliness", value: `+${cleanlinessIncrease}`, inline: true },
      {
        name: "Happiness",
        value: `+${happinessIncrease.toFixed(1)}`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleGroom(
  interaction,
  userDb,
  petName,
  nowTimestamp,
  randomPetSound
) {
  if (!userDb.actionTimeStamp) userDb.actionTimeStamp = {};
  if (!userDb.actionTimeStamp.lastGroomed)
    userDb.actionTimeStamp.lastGroomed = [];
  if (!userDb.actionTimeStamp.lastCleaned)
    userDb.actionTimeStamp.lastCleaned = [];

  if (typeof userDb.cleanedCount === "undefined") {
    userDb.cleanedCount = 0;
  }

  const now = new Date(nowTimestamp);
  const lastGroomedTime =
    userDb.actionTimeStamp.lastGroomed.length > 0
      ? new Date(userDb.actionTimeStamp.lastGroomed.slice(-1)[0]).getTime()
      : 0;
  const lastCleanedTime =
    userDb.actionTimeStamp.lastCleaned.length > 0
      ? new Date(userDb.actionTimeStamp.lastCleaned.slice(-1)[0]).getTime()
      : 0;

  if (now.getTime() - lastCleanedTime < timeStamp.sixHours()) {
    const remainingTime =
      timeStamp.sixHours() - (now.getTime() - lastCleanedTime);
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor(
      (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
    );

    const embed = new EmbedBuilder()
      .setColor("#FFA07A")
      .setTitle("Grooming Too Soon After Cleaning!")
      .setDescription(
        `${petName} was cleaned very recently. Please wait ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before grooming.`
      );

    await interaction.reply({ embeds: [embed] });
    return;
  }
  const timeSinceLastGroomed = now.getTime() - lastGroomedTime;

  userDb.cleanedCount += 1;

  if (timeSinceLastGroomed < timeStamp.twelveHours()) {
    const remainingTime = timeStamp.twelveHours() - timeSinceLastGroomed;
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor(
      (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
    );

    const embed = new EmbedBuilder()
      .setColor("#FFA07A")
      .setTitle("Grooming Too Soon!")
      .setDescription(
        `${petName} was groomed quite recently. Please wait ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before grooming again.`
      );

    await interaction.reply({ embeds: [embed] });
    return;
  }

  const cleanlinessIncrease = Math.floor(Math.random() * 26) + 30;
  userDb.cleanliness = Math.min(100, userDb.cleanliness + cleanlinessIncrease);

  let message = `${petName} looks neat and tidy.`;

  let happinessIncrease = cleanlinessIncrease * 0.25;

  if (cleanlinessIncrease > 35) {
    happinessIncrease += 10;
    message = `${petName} really enjoyed that and looks sparkling clean.`;
  }

  userDb.happiness = Math.min(100, userDb.happiness + happinessIncrease);

  userDb.actionTimeStamp.lastGroomed.push(now.toISOString());

  while (userDb.actionTimeStamp.lastGroomed.length > 3) {
    userDb.actionTimeStamp.lastGroomed.shift();
  }

  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("Grooming Successful!")
    .setDescription(`${randomPetSound} ${message}`)
    .addFields(
      { name: "Cleanliness", value: `+${cleanlinessIncrease}`, inline: true },
      {
        name: "Happiness",
        value: `+${happinessIncrease}`,
        inline: true,
      }
    )
    .setTimestamp(now);

  await interaction.reply({ embeds: [embed] });
}

async function handleFeed(interaction, userDb, petName, now, randomPetSound) {
  userDb.actionTimeStamp = userDb.actionTimeStamp || {};
  userDb.actionTimeStamp.lastFed = userDb.actionTimeStamp.lastFed || [];
  userDb.actionTimeStamp.lastDrank = userDb.actionTimeStamp.lastDrank || [];

  const canFeedFood = checkIfCanFeed(
    userDb.actionTimeStamp.lastFed,
    userDb.hunger
  );


  const canFeedWater = checkIfCanFeed(
    userDb.actionTimeStamp.lastDrank,
    userDb.thirst
  );

  let description = `${petName} looks `;
  if (userDb.isSick) {
    description += `a bit under the weather and might not feel like eating or drinking. Please try again later.`;
  } else {
    if (canFeedFood) {
      description += `hungry. 🍽️`;
    }
    if (canFeedWater) {
      if (canFeedFood) description += " and ";
      description += `thirsty. 💧`;
    }
    if (!canFeedFood && !canFeedWater) {
      description += `neither hungry nor thirsty right now.`;
    }
  }

  const feedEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(`Time to care for ${petName}`)
    .setDescription(description)
    .setTimestamp();

  const feedFoodButton = new ButtonBuilder()
    .setCustomId("feedFood")
    .setLabel("Give Food")
    .setStyle("Primary")
    .setEmoji("🍽️")
    .setDisabled(!canFeedFood || userDb.isSick);

  const feedWaterButton = new ButtonBuilder()
    .setCustomId("feedWater")
    .setLabel("Give Water")
    .setStyle("Primary")
    .setEmoji("💧")
    .setDisabled(!canFeedWater || userDb.isSick);

  const actionRow = new ActionRowBuilder().addComponents(
    feedFoodButton,
    feedWaterButton
  );

  await interaction.reply({
    embeds: [feedEmbed],
    components: [actionRow],
  });
}

function checkIfCanFeed(actionTimestamps, level) {
  const recentActions = actionTimestamps.filter(
    (time) => new Date(time).getTime() > timeStamp.tenMinutesAgo()
  );

  return level < 100 && recentActions.length < 3;
}

async function handleSleep(interaction, userDb, petName, now) {
  if (!userDb.actionTimeStamp) userDb.actionTimeStamp = {};
  if (!Array.isArray(userDb.actionTimeStamp.lastSlept) || userDb.actionTimeStamp.lastSlept.length === 0) {
    userDb.actionTimeStamp.lastSlept = [now]; 
  }

  if (typeof userDb.isAsleep === "undefined") userDb.isAsleep = false;
  if (!userDb.sleepUntil) userDb.sleepUntil = now;
  if (typeof userDb.sleepLevel === "undefined") userDb.sleepLevel = 0;
  if (typeof userDb.energy === "undefined") userDb.energy = 0;

  const isTired = userDb.energy < 30 || userDb.sleepLevel < 30;

  if (!isTired && (userDb.energy > 80 || userDb.sleepLevel > 80)) {
    await interaction.reply(
      `${petName} is not tired yet. Perhaps take them out for some exercise to reduce their energy levels.`
    );
    return;
  }

  let lastSleptTime = new Date(userDb.actionTimeStamp.lastSlept[0]).getTime();

  if (isNaN(lastSleptTime)) {
    console.error(`Invalid lastSleptTime for pet ${petName}`);
    await interaction.reply(
      "There was an error with your pet's last sleep time."
    );
    return;
  }

  const timeSinceLastSlept = now - lastSleptTime;

  const sleepCooldown = (userDb.actionTimeStamp.lastSlept.length > 1) && !isTired ? 4 * 60 * 60 * 1000 : 0;

  if (userDb.isAsleep) {
    const sleepUntilTime = new Date(userDb.sleepUntil).getTime();
    if (isNaN(sleepUntilTime)) {
      console.error(`Invalid sleepUntilTime for pet ${petName}`);
      await interaction.reply(
        "There was an error with your pet's sleep schedule."
      );
      return;
    }

    if (now < sleepUntilTime) {
      const remainingSleepTime = sleepUntilTime - now;
      const remainingSleepHours = Math.floor(
        remainingSleepTime / (60 * 60 * 1000)
      );
      const remainingSleepMinutes = Math.floor(
        (remainingSleepTime % (60 * 60 * 1000)) / (60 * 1000)
      );

      await interaction.reply(
        `${petName} is currently sleeping and will wake up in ${remainingSleepHours} hour(s) and ${remainingSleepMinutes} minute(s).`
      );
      return;
    } else {
      userDb.isAsleep = false;
      const sleepDuration = sleepUntilTime - lastSleptTime;
      if (isNaN(sleepDuration)) {
        console.error(`Invalid sleepDuration for pet ${petName}`);
        await interaction.reply(
          "There was an error with your pet's sleep duration."
        );
        return;
      }

      const maxSleepDuration = 4 * 60 * 60 * 1000;
      const recoveryPercentage = (sleepDuration / maxSleepDuration);

      userDb.energy = Math.min(userDb.energy + Math.round(recoveryPercentage * 100), 100);
      userDb.sleepLevel = Math.min(userDb.sleepLevel + Math.round(recoveryPercentage * 100), 100);
    }
  }

  if (timeSinceLastSlept < sleepCooldown) {
    const remainingTime = sleepCooldown - timeSinceLastSlept;
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor(
      (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
    );

    await interaction.reply(
      `${petName} is not tired yet. Wait another ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before trying to put them to sleep again.`
    );
    return;
  }

  const sleepDurationMs = (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000;
  const sleepUntil = new Date(now + sleepDurationMs);

  userDb.isAsleep = true;
  userDb.sleepUntil = sleepUntil;
  userDb.actionTimeStamp.lastSlept.unshift(now);

  await userDb.save();

  await interaction.reply(`${petName} is now sleeping.`);
}



async function handleVet(interaction, userDb, petName, now) {
  if (!userDb.actionTimeStamp) userDb.actionTimeStamp = {};
  if (!userDb.actionTimeStamp.lastVetVisit)
    userDb.actionTimeStamp.lastVetVisit = [];

  const lastVetVisitArray = userDb.actionTimeStamp.lastVetVisit;
  const lastVetVisitTime =
    lastVetVisitArray.length > 0
      ? new Date(lastVetVisitArray[lastVetVisitArray.length - 1]).getTime()
      : 0;
  const timeSinceLastVetVisit = now - lastVetVisitTime;

  if (userDb.isSick && timeSinceLastVetVisit < timeStamp.sixHours()) {
    const remainingHours = Math.ceil(
      (timeStamp.sixHours() - timeSinceLastVetVisit) / (60 * 60 * 1000)
    );
    await interaction.reply(
      `${petName} is currently being treated at the vet and needs to rest for another ${remainingHours} hour(s).`
    );
    return;
  }

  if (!userDb.isSick && timeSinceLastVetVisit < timeStamp.oneWeek()) {
    const remainingDays = Math.ceil(
      (timeStamp.oneWeek() - timeSinceLastVetVisit) / (24 * 60 * 60 * 1000)
    );
    await interaction.reply(
      `${petName} has already been to the vet this week. Please wait another ${remainingDays} day(s) for the next routine checkup.`
    );
    return;
  }

  let vetFindings;
  const randomChance = Math.random();
  if (randomChance < 0.5) {
    vetFindings = "is healthy";
    userDb.isSick = false;
  } else if (randomChance >= 0.5 && randomChance < 0.99) {
    const otherFindingsOptions = [
      "has been treated for fleas and will be better in a few days",
      "received their immunisations",
      "has a minor tooth issue, but nothing serious",
      "was found to be a bit underweight, so a diet change was recommended",
      "has some allergies and was prescribed medication",
    ];
    vetFindings =
      otherFindingsOptions[
        Math.floor(Math.random() * otherFindingsOptions.length)
      ];
    userDb.isSick = false;
    userDb.medicineCount = (userDb.medicineCount || 0) + 1;
  } else {
    vetFindings = "has a serious condition and needs immediate care";
    userDb.isSick = true;
    userDb.medicineCount = (userDb.medicineCount || 0) + 4;
  }

  userDb.actionTimeStamp.lastVetVisit.push(new Date(now).toISOString());

  if (userDb.actionTimeStamp.lastVetVisit.length > 5) {
    userDb.actionTimeStamp.lastVetVisit.shift();
  }

  await userDb.save();

  await interaction.reply(
    `${petName} has been taken to the vet for a routine checkup and ${vetFindings}.`
  );
}
