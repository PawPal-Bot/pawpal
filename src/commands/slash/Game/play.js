const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");
const petProfile = require("../../../schemas/PetModel");
const speechBubbles = require("../../../data/speechBubbles.json");
const timeStamp = require("../../../utils/timeStamp");
const variables = require("../../../data/variableNames");
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
    .setName("play")
    .setDescription("Interact with your pet!")
    .addSubcommand(subcommand => subcommand.setName("pat").setDescription("Pat your pet to show affection"))
    .addSubcommand(subcommand => subcommand.setName("cuddle").setDescription("Cuddle with your pet to increase bonding"))
    .addSubcommand(subcommand => subcommand.setName("hideandseek").setDescription("Your pet is hiding, can you find them?")),
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
      case "pat":
        await handlePat(interaction, petDb, petName, now, randomPetSound);
        break;
      case "cuddle":
        await handleCuddle(interaction, petDb, petName, now, randomPetSound);
        break;
      case "hideandseek":
        await handleHideAndSeek(interaction, petDb, petName, now, randomPetSound);
        break;
    }

    await petDb.save();
  },
};

async function handlePat(interaction, petDb, petName, now, randomPetSound) {
  if (petDb.energy < 5) {
    await interaction.reply(`${randomPetSound}! ${petName} is too tired for pats right now.`);
    return;
  }

  const recentPats = petDb.actionTimeStamp.lastPat.filter(patTime => new Date(patTime).getTime() > now - timeStamp.tenMinutes());

  if (recentPats.length >= 3) {
    await interaction.reply(`${petName} has been patted too much recently. Try again later.`);
    return;
  }

  const patEmbed = new EmbedBuilder()
    .setColor("#9e38fe")
    .setTitle("Pat your pet!")
    .setDescription(`${randomPetSound}! ${petName} is ready for more pats.`)
    .setFooter({
      text: `Happiness: ${variables.getHappiness(petDb.happiness)}`,
    })
    .setTimestamp();

  const patButton = new ButtonBuilder().setCustomId("pat").setLabel("Pat").setStyle("Primary");

  await interaction.reply({
    embeds: [patEmbed],
    components: [new ActionRowBuilder().addComponents(patButton)],
  });
}

async function handleCuddle(interaction, petDb, petName, now, randomPetSound) {
  const lastCuddledArray = petDb.actionTimeStamp.lastCuddled;
  const lastCuddled = lastCuddledArray.length > 0 ? new Date(lastCuddledArray[lastCuddledArray.length - 1]) : null;

  if (lastCuddled && now - lastCuddled.getTime() < timeStamp.thirtyMinutes()) {
    const timeRemaining = timeStamp.thirtyMinutes() - (now - lastCuddled.getTime());
    const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
    await interaction.reply({
      content: `You've already cuddled ${petName} within the last 30 minutes. Please wait ${remainingMinutes} minute(s) before cuddling again.`,
    });
    return;
  }

  petDb.actionTimeStamp.lastCuddled.push(now);
  if (petDb.actionTimeStamp.lastCuddled.length > 5) {
    petDb.actionTimeStamp.lastCuddled.shift();
  }

  const affectionIncrease = Math.floor(Math.random() * 17) + 4;
  const initialAffection = petDb.affection;
  petDb.affection = Math.min(petDb.affection + affectionIncrease, 100);
  let affectionChange = petDb.affection - initialAffection;
  affectionChange = Math.max(4, affectionChange);
  affectionChange = Math.min(20, affectionChange);
  affectionChange = parseFloat(affectionChange.toFixed(2));

  const happinessIncrease = Math.floor(Math.random() * 25) + 1;
  const initialHappiness = petDb.happiness;
  petDb.happiness = Math.min(petDb.happiness + happinessIncrease, 100);
  let happinessChange = petDb.happiness - initialHappiness;
  happinessChange = Math.max(2, happinessChange);
  happinessChange = parseFloat(happinessChange.toFixed(2));

  const energyDecrease = Math.floor(Math.random() * 17) + 4;
  const initialEnergy = petDb.energy;
  petDb.energy = Math.max(petDb.energy - energyDecrease, 0);
  let energyChange = petDb.energy - initialEnergy;
  energyChange = Math.max(4, energyChange);
  energyChange = Math.min(20, energyChange);
  energyChange = parseFloat(energyChange.toFixed(2));

  petDb.cuddleCount++;

  await petDb.save();

  const cuddleEmbed = new EmbedBuilder()
    .setColor("#9e38fe")
    .setTitle("Cuddle Time!")
    .setDescription(`${randomPetSound}! You cuddled with ${petName}. It looks very happy!`)
    .addFields(
      {
        name: "Energy",
        value: `${variables.getEnergy(petDb.energy)} (${energyChange >= 0 ? "+" : "-"}${energyChange})`,
        inline: true,
      },
      {
        name: "Affection",
        value: `${variables.getAffection(petDb.affection)} (${affectionChange >= 0 ? "+" : "-"}${affectionChange})`,
        inline: true,
      },
      {
        name: "Happiness",
        value: `${variables.getHappiness(petDb.happiness)} (${happinessChange >= 0 ? "+" : "-"}${happinessChange})`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [cuddleEmbed],
  });
}

async function handleHideAndSeek(interaction, petDb, petName, now, randomPetSound) {
  await interaction.deferReply();

  const allLocations = [
    { emoji: "🛏️", name: "Bedroom" },
    { emoji: "🛋️", name: "Living Room" },
    { emoji: "🍽️", name: "Dining Area" },
    { emoji: "🚿", name: "Bathroom" },
    { emoji: "📚", name: "Study" },
    { emoji: "🏡", name: "Backyard" },
    { emoji: "🌳", name: "Old Oak Tree" },
    { emoji: "🌼", name: "Flower Garden" },
    { emoji: "🎠", name: "Playground" },
    { emoji: "🌿", name: "Greenhouse" },
  ];

  const locations = shuffleArray([...allLocations]);

  const selectedLocations = locations.slice(0, 5);

  const buttonComponents = selectedLocations.map((location, index) => {
    const customId = `hideandseek_${index}`;
    return {
      customId: customId,
      label: location.name,
      emoji: location.emoji,
      style: ButtonStyle.Secondary,
      locationObject: {
        buttonId: customId,
        locationName: location.name,
      },
    };
  });

  await petProfile.findOneAndUpdate(
    { userId: interaction.user.id },
    {
      $set: {
        "miniGames.hideAndSeek": {
          isActive: true,
          attempts: 0,
          isFound: false,
          buttonLocations: buttonComponents.map(comp => comp.locationObject),
        },
      },
    },
    { new: true, upsert: true }
  );

  const components = buttonComponents.map(comp => new ButtonBuilder().setCustomId(comp.customId).setLabel(comp.label).setEmoji(comp.emoji).setStyle(comp.style));

  const actionRows = [];
  while (components.length > 0) {
    actionRows.push(new ActionRowBuilder().addComponents(components.splice(0, 5)));
  }

  await interaction.editReply({
    content: `${petName} is hiding! Where do you want to seek?`,
    components: actionRows,
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
