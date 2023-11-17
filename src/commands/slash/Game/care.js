const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require("discord.js");
const petProfile = require("../../../schemas/PetModel");
const speechBubbles = require("../../../data/speechBubbles.json");
const timeStamp = require("../../../utils/timeStamp");
const checkPetStatus = require("../../../utils/eventChecks");

function getPetSounds(petDb) {
  const petTypeStrMap = {
    1: "dog",
    2: "cat",
    3: "redPanda",
  };

  const petTypeStr = petTypeStrMap[petDb.petType];
  if (!petTypeStr) {
    console.error("Invalid pet type:", petDb.petType);
    return null;
  }

  const randomPetSound = speechBubbles[petTypeStr][Math.floor(Math.random() * speechBubbles[petTypeStr].length)];

  return { petTypeStr, randomPetSound };
}

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("care")
    .setDescription("Care for your pet!")
    .addSubcommand(subcommand => subcommand.setName("clean").setDescription("Clean your pet"))
    .addSubcommand(subcommand => subcommand.setName("groom").setDescription("Groom your pet"))
    .addSubcommand(subcommand => subcommand.setName("feed").setDescription("Feed your pet"))
    .addSubcommand(subcommand => subcommand.setName("sleep").setDescription("Put your pet to sleep for a while"))
    .addSubcommand(subcommand => subcommand.setName("vet").setDescription("Take your pet to the vet for a checkup")),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const petDb = await petProfile.findOne({ userId: interaction.user.id });

    if (!petDb || petDb.petType === 0) {
      await interaction.reply("You don't have a pet to interact with!");
      return;
    }

    const petName = petDb.petName || "Your pet";
    const subcommand = interaction.options.getSubcommand();
    const now = Date.now();
    const { petTypeStr, randomPetSound } = getPetSounds(petDb);
    if (!petTypeStr) {
      await interaction.reply("There was an error with your pet type.");
      return;
    }

    const canContinue = await checkPetStatus(interaction, petName, Date.now());
    if (!canContinue) {
      return;
    }

    switch (subcommand) {
      case "clean":
        await handleClean(interaction, petDb, petName, now, randomPetSound);
        break;
      case "groom":
        await handleGroom(interaction, petDb, petName, now, randomPetSound);
        break;
      case "feed":
        await handleFeed(interaction, petDb, petName, now, randomPetSound);
        break;
      case "sleep":
        await handleSleep(interaction, petDb, petName, now, randomPetSound);
        break;
      case "vet":
        await handleVet(interaction, petDb, petName, now, randomPetSound);
        break;
    }
    await petDb.save();
  },
};

async function handleClean(interaction, petDb, petName, now, randomPetSound) {
  if (!petDb.actionTimeStamp) petDb.actionTimeStamp = {};
  if (!petDb.actionTimeStamp.lastCleaned) petDb.actionTimeStamp.lastCleaned = [];

  if (typeof petDb.cleanedCount === "undefined") {
    petDb.cleanedCount = 0;
  }

  const lastCleanedTime = petDb.actionTimeStamp.lastCleaned.length > 0 ? new Date(petDb.actionTimeStamp.lastCleaned.slice(-1)[0]).getTime() : 0;
  const lastGroomedTime = petDb.actionTimeStamp.lastGroomed.length > 0 ? new Date(petDb.actionTimeStamp.lastGroomed.slice(-1)[0]).getTime() : 0;

  if (now - lastCleanedTime < timeStamp.twelveHours() || now - lastGroomedTime < timeStamp.twelveHours()) {
    const timeToNextAllowedClean = Math.max(timeStamp.twelveHours() - (now - lastCleanedTime), timeStamp.twelveHours() - (now - lastGroomedTime));
    const remainingHours = Math.floor(timeToNextAllowedClean / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((timeToNextAllowedClean % (60 * 60 * 1000)) / (60 * 1000));

    const embed = new EmbedBuilder()
      .setColor("#FFA07A")
      .setTitle("Cleaning Too Soon!")
      .setDescription(`${petName} was cleaned or groomed quite recently. Please wait ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before cleaning again.`);

    await interaction.reply({ embeds: [embed] });
    return;
  }

  const cleanlinessIncrease = Math.floor(Math.random() * 16) + 5; // 5 to 20
  petDb.cleanliness = Math.min(100, petDb.cleanliness + cleanlinessIncrease);

  let happinessIncrease = cleanlinessIncrease * 0.25;
  if (cleanlinessIncrease >= 15) {
    happinessIncrease += 10;
  }
  petDb.happiness = Math.min(100, petDb.happiness + happinessIncrease);

  petDb.actionTimeStamp.lastCleaned.push(new Date(now).toISOString());

  while (petDb.actionTimeStamp.lastCleaned.length > 3) {
    petDb.actionTimeStamp.lastCleaned.shift();
  }

  petDb.cleanedCount += 1;

  await petDb.save();

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

async function handleGroom(interaction, petDb, petName, now, randomPetSound) {
  if (!petDb.actionTimeStamp) petDb.actionTimeStamp = {};
  if (!petDb.actionTimeStamp.lastGroomed) petDb.actionTimeStamp.lastGroomed = [];
  if (!petDb.actionTimeStamp.lastCleaned) petDb.actionTimeStamp.lastCleaned = [];

  if (typeof petDb.cleanedCount === "undefined") {
    petDb.cleanedCount = 0;
  }

  const lastGroomedTime = petDb.actionTimeStamp.lastGroomed.length > 0 ? new Date(petDb.actionTimeStamp.lastGroomed.slice(-1)[0]).getTime() : 0;
  const lastCleanedTime = petDb.actionTimeStamp.lastCleaned.length > 0 ? new Date(petDb.actionTimeStamp.lastCleaned.slice(-1)[0]).getTime() : 0;

  if (now - lastCleanedTime < timeStamp.sixHours()) {
    const remainingTime = timeStamp.sixHours() - (now - lastCleanedTime);
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    const embed = new EmbedBuilder()
      .setColor("#FFA07A")
      .setTitle("Grooming Too Soon After Cleaning!")
      .setDescription(`${petName} was cleaned very recently. Please wait ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before grooming.`);

    await interaction.reply({ embeds: [embed] });
    return;
  }
  const timeSinceLastGroomed = now - lastGroomedTime;

  petDb.cleanedCount += 1;

  if (timeSinceLastGroomed < timeStamp.twelveHours()) {
    const remainingTime = timeStamp.twelveHours() - timeSinceLastGroomed;
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    const embed = new EmbedBuilder()
      .setColor("#FFA07A")
      .setTitle("Grooming Too Soon!")
      .setDescription(`${petName} was groomed quite recently. Please wait ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before grooming again.`);

    await interaction.reply({ embeds: [embed] });
    return;
  }

  const cleanlinessIncrease = Math.floor(Math.random() * 26) + 30;
  petDb.cleanliness = Math.min(100, petDb.cleanliness + cleanlinessIncrease);

  let message = `${petName} looks neat and tidy.`;

  let happinessIncrease = cleanlinessIncrease * 0.25;

  if (cleanlinessIncrease > 35) {
    happinessIncrease += 10;
    message = `${petName} really enjoyed that and looks sparkling clean.`;
  }

  petDb.happiness = Math.min(100, petDb.happiness + happinessIncrease);

  petDb.actionTimeStamp.lastGroomed.push(now);

  while (petDb.actionTimeStamp.lastGroomed.length > 3) {
    petDb.actionTimeStamp.lastGroomed.shift();
  }

  await petDb.save();

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

async function handleFeed(interaction, petDb, petName) {
  petDb.actionTimeStamp = petDb.actionTimeStamp || {};
  petDb.actionTimeStamp.lastFed = petDb.actionTimeStamp.lastFed || [];
  petDb.actionTimeStamp.lastDrank = petDb.actionTimeStamp.lastDrank || [];

  const canFeedFood = checkIfCanFeed(petDb.actionTimeStamp.lastFed, petDb.hunger);

  const canFeedWater = checkIfCanFeed(petDb.actionTimeStamp.lastDrank, petDb.thirst);

  let description = `${petName} looks `;
  if (petDb.isSick) {
    description += `a bit under the weather and might not feel like eating or drinking. Please try again later.`;
  } else {
    if (canFeedFood) {
      description += `hungry 🍽️`;
    }
    if (canFeedWater) {
      if (canFeedFood) description += " and ";
      description += `thirsty 💧`;
    }
    if (!canFeedFood && !canFeedWater) {
      description += `neither hungry nor thirsty right now.`;
    }
  }

  const feedEmbed = new EmbedBuilder().setColor("#0099ff").setTitle(`Time to care for ${petName}`).setDescription(description).setTimestamp();

  const feedFoodButton = new ButtonBuilder()
    .setCustomId("feedFood")
    .setLabel("Give Food")
    .setStyle("Primary")
    .setEmoji("🍽️")
    .setDisabled(!canFeedFood || petDb.isSick);

  const feedWaterButton = new ButtonBuilder()
    .setCustomId("feedWater")
    .setLabel("Give Water")
    .setStyle("Primary")
    .setEmoji("💧")
    .setDisabled(!canFeedWater || petDb.isSick);

  const actionRow = new ActionRowBuilder().addComponents(feedFoodButton, feedWaterButton);

  await interaction.reply({
    embeds: [feedEmbed],
    components: [actionRow],
  });
}

function checkIfCanFeed(actionTimestamps, level) {
  const recentActions = actionTimestamps.filter(time => new Date(time).getTime() > timeStamp.tenMinutesAgo());

  return level < 100 && recentActions.length < 3;
}

async function handleSleep(interaction, petDb, petName, now) {
  if (!petDb.actionTimeStamp) petDb.actionTimeStamp = {};
  if (!Array.isArray(petDb.actionTimeStamp.lastSlept) || petDb.actionTimeStamp.lastSlept.length === 0) {
    petDb.actionTimeStamp.lastSlept = [now];
  }

  if (typeof petDb.isAsleep === "undefined") petDb.isAsleep = false;
  if (!petDb.sleepUntil) petDb.sleepUntil = now;
  if (typeof petDb.sleepLevel === "undefined") petDb.sleepLevel = 0;
  if (typeof petDb.energy === "undefined") petDb.energy = 0;

  const isTired = petDb.energy < 30 || petDb.sleepLevel < 30;

  if (!isTired && (petDb.energy > 80 || petDb.sleepLevel > 80)) {
    await interaction.reply(`${petName} is not tired yet. Perhaps take them out for some exercise to reduce their energy levels.`);
    return;
  }

  let lastSleptTime = new Date(petDb.actionTimeStamp.lastSlept[0]).getTime();

  if (isNaN(lastSleptTime)) {
    console.error(`Invalid lastSleptTime for pet ${petName}`);
    await interaction.reply("There was an error with your pet's last sleep time.");
    return;
  }

  const timeSinceLastSlept = now - lastSleptTime;

  const sleepCooldown = petDb.actionTimeStamp.lastSlept.length > 1 && !isTired ? 4 * 60 * 60 * 1000 : 0;

  if (petDb.isAsleep) {
    const sleepUntilTime = new Date(petDb.sleepUntil).getTime();
    if (isNaN(sleepUntilTime)) {
      console.error(`Invalid sleepUntilTime for pet ${petName}`);
      await interaction.reply("There was an error with your pet's sleep schedule.");
      return;
    }

    if (now < sleepUntilTime) {
      const remainingSleepTime = sleepUntilTime - now;
      const remainingSleepHours = Math.floor(remainingSleepTime / (60 * 60 * 1000));
      const remainingSleepMinutes = Math.floor((remainingSleepTime % (60 * 60 * 1000)) / (60 * 1000));

      await interaction.reply(`${petName} is currently sleeping and will wake up in ${remainingSleepHours} hour(s) and ${remainingSleepMinutes} minute(s).`);
      return;
    } else {
      petDb.isAsleep = false;
      const sleepDuration = sleepUntilTime - lastSleptTime;
      if (isNaN(sleepDuration)) {
        console.error(`Invalid sleepDuration for pet ${petName}`);
        await interaction.reply("There was an error with your pet's sleep duration.");
        return;
      }

      const maxSleepDuration = 4 * 60 * 60 * 1000;
      const recoveryPercentage = sleepDuration / maxSleepDuration;

      petDb.energy = Math.min(petDb.energy + Math.round(recoveryPercentage * 100), 100);
      petDb.sleepLevel = Math.min(petDb.sleepLevel + Math.round(recoveryPercentage * 100), 100);
    }
  }

  if (timeSinceLastSlept < sleepCooldown) {
    const remainingTime = sleepCooldown - timeSinceLastSlept;
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    await interaction.reply(`${petName} is not tired yet. Wait another ${remainingHours} hour(s) and ${remainingMinutes} minute(s) before trying to put them to sleep again.`);
    return;
  }

  const sleepDurationMs = (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000;
  const sleepUntil = new Date(now + sleepDurationMs);

  petDb.isAsleep = true;
  petDb.sleepUntil = sleepUntil;
  petDb.actionTimeStamp.lastSlept.unshift(now);

  await petDb.save();

  await interaction.reply(`${petName} is now sleeping.`);
}

async function handleVet(interaction, petDb, petName, now) {
  if (!petDb.actionTimeStamp) petDb.actionTimeStamp = {};
  if (!petDb.actionTimeStamp.lastVetVisit) petDb.actionTimeStamp.lastVetVisit = [];

  const lastVetVisitArray = petDb.actionTimeStamp.lastVetVisit;
  const lastVetVisitTime = lastVetVisitArray.length > 0 ? new Date(lastVetVisitArray[lastVetVisitArray.length - 1]).getTime() : 0;
  const timeSinceLastVetVisit = now - lastVetVisitTime;

  if (petDb.isSick && timeSinceLastVetVisit < timeStamp.sixHours()) {
    const remainingHours = Math.ceil((timeStamp.sixHours() - timeSinceLastVetVisit) / (60 * 60 * 1000));
    await interaction.reply(`${petName} is currently being treated at the vet and needs to rest for another ${remainingHours} hour(s).`);
    return;
  }

  if (!petDb.isSick && timeSinceLastVetVisit < timeStamp.oneWeek()) {
    const remainingDays = Math.ceil((timeStamp.oneWeek() - timeSinceLastVetVisit) / (24 * 60 * 60 * 1000));
    await interaction.reply(`${petName} has already been to the vet this week. Please wait another ${remainingDays} day(s) for the next routine checkup.`);
    return;
  }

  let vetFindings;
  const randomChance = Math.random();
  if (randomChance < 0.5) {
    vetFindings = "is healthy";
    petDb.isSick = false;
  } else if (randomChance >= 0.5 && randomChance < 0.99) {
    const otherFindingsOptions = [
      "has been treated for fleas and will be better in a few days",
      "received their immunisations",
      "has a minor tooth issue, but nothing serious",
      "was found to be a bit underweight, so a diet change was recommended",
      "has some allergies and was prescribed medication",
    ];
    vetFindings = otherFindingsOptions[Math.floor(Math.random() * otherFindingsOptions.length)];
    petDb.isSick = false;
    petDb.medicineCount = (petDb.medicineCount || 0) + 1;
  } else {
    vetFindings = "has a serious condition and needs immediate care";
    petDb.isSick = true;
    petDb.medicineCount = (petDb.medicineCount || 0) + 4;
  }

  petDb.vetCount = (petDb.vetCount || 0) + 1;
  petDb.actionTimeStamp.lastVetVisit.push(new Date(now).toISOString());

  if (petDb.actionTimeStamp.lastVetVisit.length > 5) {
    petDb.actionTimeStamp.lastVetVisit.shift();
  }

  await petDb.save();

  await interaction.reply(`${petName} has been taken to the vet for a routine checkup and ${vetFindings}.`);
}
