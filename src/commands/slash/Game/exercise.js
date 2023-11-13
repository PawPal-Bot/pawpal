const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const petProfile = require('../../../schemas/PetModel');
const speechBubbles = require('../../../data/speechBubbles.json');
const timeStamp = require('../../../utils/timeStamp');
const variables = require('../../../data/variableNames');
const checkPetStatus = require('../../../utils/eventChecks');

function getPetSounds(petDb) {
  const petTypeStrMap = {
    1: 'dog',
    2: 'cat',
    3: 'redPanda',
  };

  const petTypeStr = petTypeStrMap[petDb.petType];
  if (!petTypeStr) {
    console.error('Invalid pet type:', petDb.petType);
    return null;
  }

  const randomPetSound = speechBubbles[petTypeStr][Math.floor(Math.random() * speechBubbles[petTypeStr].length)];

  return {
    petTypeStr,
    randomPetSound,
  };
}

module.exports = {
  structure: new SlashCommandBuilder()
    .setName('exercise')
    .setDescription('Interact with your pet!')
    .addSubcommand(subcommand => subcommand.setName('walk').setDescription('Take your pet for a walk'))
    .addSubcommand(subcommand => subcommand.setName('run').setDescription('Take your pet for a run'))
    .addSubcommand(subcommand => subcommand.setName('hunt').setDescription('Take your pet hunting')),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const petDb = await petProfile.findOne({
      userId: interaction.user.id,
    });

    if (!petDb || petDb.petType === 0) {
      await interaction.reply("You don't have a pet to interact with!");
      return;
    }

    const petName = petDb.petName || 'Your pet';
    const subcommand = interaction.options.getSubcommand();

    const now = Date.now();

    const { petTypeStr, randomPetSound } = getPetSounds(petDb);
    if (!petTypeStr) {
      await interaction.reply('There was an error with your pet type.');
      return;
    }

    const canContinue = await checkPetStatus(interaction, petName, Date.now());
    if (!canContinue) {
      return;
    }

    switch (subcommand) {
      case 'walk':
        await handleWalk(interaction, petDb, petName, now, randomPetSound);
        break;
      case 'run':
        await handleRun(interaction, petDb, petName, now, randomPetSound);
        break;
      case 'hunt':
        await handleHunt(interaction, petDb, petName, now, randomPetSound);
        break;
    }
    await petDb.save();
  },
};

async function handleWalk(interaction, petDb, petName, now, randomPetSound) {
  const lastWalked = petDb.actionTimeStamp.lastWalked?.[0] ? new Date(petDb.actionTimeStamp.lastWalked[0]) : null;
  const lastRan = petDb.actionTimeStamp.lastRan?.[0] ? new Date(petDb.actionTimeStamp.lastRan[0]) : null;

  if ((lastWalked && now - lastWalked.getTime() < timeStamp.oneHour()) || (lastRan && now - lastRan.getTime() < timeStamp.oneHour())) {
    const timeRemaining = Math.max(lastWalked ? timeStamp.oneHour() - (now - lastWalked.getTime()) : 0, lastRan ? timeStamp.oneHour() - (now - lastRan.getTime()) : 0);
    const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
    await interaction.reply({
      content: `Please wait ${remainingMinutes} minute(s). ${petName} is still tired from the last activity.`,
    });
    return;
  }

  // Add the current time to the lastWalked array and keep the last 5 entries
  petDb.actionTimeStamp.lastWalked.unshift(new Date().toISOString());
  petDb.actionTimeStamp.lastWalked = petDb.actionTimeStamp.lastWalked.slice(0, 5);

  // Calculate the changes in energy, affection, and happiness
  let energyDecreasePercentage = Math.random() * 7 + 5;
  let affectionIncrease = 2;
  let happinessIncrease = 2;
  let description = `It was refreshing and enjoyable. ${randomPetSound} ${petName} is looking happier!`;

  if (petDb.petType === 2) {
    // If the pet is a cat
    energyDecreasePercentage *= 1.5; // Cats get tired more quickly from walks
    affectionIncrease = -2; // Cats might not like walks as much
    happinessIncrease = -2; // Same for happiness
    description = `${petName} didn't seem to enjoy the walk very much. Cats often prefer to stay indoors.`;
  }

  // Calculate the actual energy decrease
  const energyDecrease = Math.round(petDb.energy * (energyDecreasePercentage / 100));
  petDb.energy = Math.max(petDb.energy - energyDecrease, 0);

  // Calculate the new affection and happiness, ensuring they are within bounds
  petDb.affection = Math.min(Math.max(petDb.affection + affectionIncrease, 0), 100);
  petDb.happiness = Math.min(Math.max(petDb.happiness + happinessIncrease, 0), 100);

  await petDb.save(); // Assuming this is the correct method to save your petDb

  // Generate the embed with changes displayed
  const walkEmbed = new EmbedBuilder()
    .setColor('#9e38fe')
    .setTitle(`${petName} went for a walk!`)
    .setDescription(description)
    .addFields(
      {
        name: 'Energy',
        value: `${variables.getEnergy(petDb.energy)} (${energyDecrease > 0 ? '-' : '+'}${energyDecrease})`,
        inline: true,
      },
      {
        name: 'Affection',
        value: `${variables.getAffection(petDb.affection)} (${affectionIncrease > 0 ? '+' : ''}${affectionIncrease})`,
        inline: true,
      },
      {
        name: 'Happiness',
        value: `${variables.getHappiness(petDb.happiness)} (${happinessIncrease > 0 ? '+' : ''}${happinessIncrease})`,
        inline: true,
      }
    )
    .setTimestamp();

  // Reply with the embed
  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ embeds: [walkEmbed] });
  } else {
    await interaction.reply({ embeds: [walkEmbed] });
  }
}

async function handleRun(interaction, petDb, petName, now, randomPetSound) {
  const lastWalked = petDb.actionTimeStamp.lastWalked?.[0] ? new Date(petDb.actionTimeStamp.lastWalked[0]) : null;
  const lastRan = petDb.actionTimeStamp.lastRan?.[0] ? new Date(petDb.actionTimeStamp.lastRan[0]) : null;

  if ((lastWalked && now - lastWalked.getTime() < timeStamp.oneHour()) || (lastRan && now - lastRan.getTime() < timeStamp.oneHour())) {
    const timeRemaining = Math.max(lastWalked ? timeStamp.oneHour() - (now - lastWalked.getTime()) : 0, lastRan ? timeStamp.oneHour() - (now - lastRan.getTime()) : 0);
    const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
    await interaction.reply({
      content: `Please wait ${remainingMinutes} minute(s). ${petName} is still recovering from the last activity.`,
    });
    return;
  }

  // Add the current time to the lastRan array and keep the last 5 entries
  petDb.actionTimeStamp.lastRan.unshift(new Date().toISOString());
  petDb.actionTimeStamp.lastRan = petDb.actionTimeStamp.lastRan.slice(0, 5);

  // Calculate the changes in energy, affection, and happiness
  let energyDecreasePercentage = Math.random() * 10 + 15;
  let affectionChange = 1;
  let happinessChange = 2;
  let description = `${randomPetSound} That was intense! ${petName} is now quite tired but feeling accomplished.`;

  if (petDb.petType === 2) {
    // If the pet is a cat
    energyDecreasePercentage *= 1.5;
    affectionChange = -1;
    happinessChange = -2;
    description = `${randomPetSound} It seems ${petName} didn't enjoy the run too much. Cats are independent creatures and prefer not to overexert themselves.`;
  }

  // Calculate the actual energy decrease
  const energyDecrease = Math.round(petDb.energy * (energyDecreasePercentage / 100));
  petDb.energy = Math.max(petDb.energy - energyDecrease, 0);

  // Calculate the new affection and happiness, ensuring they are within bounds
  petDb.affection = Math.min(Math.max(petDb.affection + affectionChange, 0), 100);
  petDb.happiness = Math.min(Math.max(petDb.happiness + happinessChange, 0), 100);

  await petDb.save(); // Assuming this is the correct method to save your petDb

  // Generate the embed with changes displayed
  const runEmbed = new EmbedBuilder()
    .setColor('#9e38fe')
    .setTitle(`${petName} went for a run!`)
    .setDescription(description)
    .addFields(
      {
        name: 'Energy',
        value: `${variables.getEnergy(petDb.energy)} (${energyDecrease > 0 ? '-' : '+'}${energyDecrease})`,
        inline: true,
      },
      {
        name: 'Affection',
        value: `${variables.getAffection(petDb.affection)} (${affectionChange >= 0 ? '+' : ''}${affectionChange})`,
        inline: true,
      },
      {
        name: 'Happiness',
        value: `${variables.getHappiness(petDb.happiness)} (${happinessChange >= 0 ? '+' : ''}${happinessChange})`,
        inline: true,
      }
    )
    .setTimestamp();

  // Reply with the embed
  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ embeds: [runEmbed] });
  } else {
    await interaction.reply({ embeds: [runEmbed] });
  }
}

async function handleHunt(interaction, petDb, petName, now, randomPetSound) {
  const huntMessages = {
    success: {
      cat: [
        `${petName} stealthily caught a small bird, proudly presenting it.`,
        `${petName} has successfully stalked and captured a cheeky mouse.`,
        `${petName} leaps and catches a butterfly, looking quite satisfied with itself.`,
        `${petName} found a lizard basking in the sun and seized the opportunity.`,
        `${petName} managed to catch a fish from the garden pond!`,
      ],
      dog: [
        `${petName} playfully chased down a leaf on the wind.`,
        `${petName} dug up an old bone, wagging their tail excitedly.`,
        `${petName} managed to catch a frisbee mid-air, what a catch!`,
        `${petName} sprinted after a squirrel and triumphantly returned with a stick.`,
        `${petName} brought back a ball they found in the bushes.`,
      ],
      redPanda: [
        `${petName} found some delicious berries and is munching happily.`,
        `${petName} has caught a cricket! It's a small victory.`,
        `${petName} discovered a nest of tasty eggs and is feeling proud.`,
        `${petName} snagged a juicy apple from a low hanging branch.`,
        `${petName} outwitted a frog at the pond's edge.`,
      ],
    },
    failure: {
      cat: [
        `${petName} stalked a bird, but it flew away at the last second.`,
        `${petName} pounced too early and missed the mouse.`,
        `${petName} was outsmarted by a clever fish that swam away.`,
        `${petName} got distracted by a leaf and lost track of the lizard.`,
        `${petName} was too slow to catch the butterfly this time.`,
      ],
      dog: [
        `${petName} chased their tail for a while but didn't catch anything else.`,
        `${petName} barked up the wrong tree, the squirrel got away.`,
        `${petName} got a little too enthusiastic and scared off the birds.`,
        `${petName} dug many holes but came back without any treasure.`,
        `${petName} was outpaced by a rabbit, better luck next time!`,
      ],
      redPanda: [
        `${petName} was too slow to catch the butterfly today.`,
        `${petName} looked for bamboo but found none, looking a bit disappointed.`,
        `${petName} attempted to snatch a fish, but it slipped away.`,
        `${petName} climbed a tree in pursuit of a snack, but came back empty-handed.`,
        `${petName} got outmaneuvered by a quick-moving lizard.`,
      ],
    },
  };
  const lastHuntedArray = petDb.actionTimeStamp.lastHunted;
  const lastHunted = lastHuntedArray.length > 0 ? new Date(lastHuntedArray[lastHuntedArray.length - 1]) : null;
  const oneHour = 3600000;

  if (lastHunted && now - lastHunted.getTime() < oneHour) {
    const timeRemaining = oneHour - (now - lastHunted.getTime());
    const remainingMinutes = Math.ceil(timeRemaining / 60000);

    await interaction.reply(`${petName} has already hunted recently. Please wait ${remainingMinutes} more minute(s) before hunting again.`);
    return;
  }

  const successRates = {
    cat: 0.7,
    dog: 0.3,
    redPanda: 0.4,
  };

  const petTypeKey = petDb.petType === 1 ? 'dog' : petDb.petType === 2 ? 'cat' : 'redPanda';
  const huntSuccess = Math.random() < successRates[petTypeKey];

  const baseStats = {
    cat: { baseHungerChange: 6, baseThirstChange: 6 },
    dog: { baseHungerChange: 10, baseThirstChange: 10 },
    redPanda: { baseHungerChange: 5, baseThirstChange: 5 },
  };

  const { baseHungerChange, baseThirstChange } = baseStats[petTypeKey];

  const randomFactor = 0.5 + Math.random() * 0.5;
  const energyConsumption = Math.round(15 * randomFactor);
  const exerciseGain = Math.round(5 * randomFactor);
  const happinessChange = huntSuccess ? Math.round(10 * randomFactor) : -Math.round(5 * randomFactor);

  let thirstChange = Math.round(baseThirstChange * randomFactor);
  let hungerChange = Math.round(baseHungerChange * randomFactor);

  if (huntSuccess) {
    thirstChange = Math.abs(thirstChange);
    hungerChange = Math.abs(hungerChange);
  } else {
    thirstChange = -Math.abs(thirstChange);
    hungerChange = -Math.abs(hungerChange);
  }

  const statsToUpdate = {
    happiness: happinessChange,
    energy: -energyConsumption,
    exerciseLevel: exerciseGain,
    hunger: hungerChange,
    thirst: thirstChange,
    cleanliness: -Math.round(7 * randomFactor),
    affection: Math.round(4 * randomFactor),
    sleepLevel: -Math.round(15 * randomFactor),
  };

  for (const stat in statsToUpdate) {
    petDb[stat] = Math.max(0, Math.min(100, petDb[stat] + statsToUpdate[stat]));
  }

  petDb.huntCount += 1;
  petDb.actionTimeStamp.lastHunted.push(now);

  if (petDb.actionTimeStamp.lastHunted.length > 3) {
    petDb.actionTimeStamp.lastHunted.shift();
  }

  await petDb.save();

  const huntResultMessage = huntSuccess
    ? huntMessages.success[petTypeKey][Math.floor(Math.random() * huntMessages.success[petTypeKey].length)]
    : huntMessages.failure[petTypeKey][Math.floor(Math.random() * huntMessages.failure[petTypeKey].length)];

  const huntEmbed = new EmbedBuilder()
    .setColor('#9e38fe')
    .setTitle(`${petName} went on a hunt!`)
    .setDescription(huntResultMessage)
    .addFields(
      {
        name: `Energy`,
        value: `${variables.getEnergy(petDb.energy)} (${energyConsumption > 0 ? '-' : '+'}${Math.abs(energyConsumption)})`,
        inline: true,
      },
      {
        name: `Exercise Level`,
        value: `${variables.getExercise(petDb.exerciseLevel)} (${exerciseGain > 0 ? '+' : '-'}${Math.abs(exerciseGain)})`,
        inline: true,
      },
      {
        name: `Hunger`,
        value: `${variables.getHunger(petDb.hunger)} (${hungerChange > 0 ? '+' : '-'}${Math.abs(hungerChange)})`,
        inline: true,
      },
      {
        name: `Thirst`,
        value: `${variables.getThirst(petDb.thirst)} (${thirstChange > 0 ? '+' : '-'}${Math.abs(thirstChange)})`,
        inline: true,
      },
      {
        name: `Cleanliness`,
        value: `${variables.getCleanliness(petDb.cleanliness)} (${-Math.round(7 * randomFactor) > 0 ? '-' : '+'}${Math.abs(-Math.round(7 * randomFactor))})`,
        inline: true,
      },
      {
        name: `Affection`,
        value: `${variables.getAffection(petDb.affection)} (${Math.round(4 * randomFactor) > 0 ? '+' : '-'}${Math.abs(Math.round(4 * randomFactor))})`,
        inline: true,
      },
      {
        name: `Sleep Level`,
        value: `${variables.getSleep(petDb.sleepLevel)} (${-Math.round(15 * randomFactor) > 0 ? '-' : '+'}${Math.abs(-Math.round(15 * randomFactor))})`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [huntEmbed],
  });
}
