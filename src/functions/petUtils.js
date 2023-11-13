const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const variables = require('../data/variableNames');

function generateEmbeds(petProfile) {
  const baseImageUrl = 'https://fjord.au/assets/pawpal';
  const petTypeFolder = petProfile.petType === 1 ? 'dog' : petProfile.petType === 2 ? 'cat' : 'redpanda';
  const emotionSuffix = petProfile.happiness < 30 ? 'A' : petProfile.happiness <= 60 ? 'N' : 'H';
  const imageUrl = `${baseImageUrl}/${petTypeFolder}/${petTypeFolder}${emotionSuffix}.png`;

  const basicInfoEmbed = createBasicInfoEmbed(petProfile, imageUrl);
  const healthNeedsEmbed = createHealthNeedsEmbed(petProfile, imageUrl);
  const interactionsEmbed = createInteractionsEmbed(petProfile, imageUrl);

  return [basicInfoEmbed, healthNeedsEmbed, interactionsEmbed];
}

function createBasicInfoEmbed(petProfile, imageUrl) {
  const scaledAffection = petProfile.affection.toFixed(2);
  const scaledHappiness = petProfile.happiness.toFixed(2);
  const scaledEnergy = petProfile.energy.toFixed(2);

  return new EmbedBuilder()
    .setTitle(`${petProfile.petName ? petProfile.petName : 'Unnamed Pet'}'s Profile`)
    .setThumbnail(imageUrl)
    .addFields(
      {
        name: '**Pet Details**',
        value: `\`🐾 Type:\` ${petTypeToString(petProfile.petType)}\n\`🌟 Life Stage:\` ${lifeStageToString(petProfile.lifeStage)}\n\`🎂 Age:\` ${petProfile.age} days old`,
        inline: false,
      },
      {
        name: '**Current State**',
        value: `\`💕 Affection:\` ${variables.getAffection(petProfile.affection)} (${scaledAffection})\n\`😄 Happiness:\` ${variables.getHappiness(
          petProfile.happiness
        )} (${scaledHappiness})\n\`😴 Energy:\` ${variables.getEnergy(petProfile.energy)} (${scaledEnergy})`,
        inline: false,
      },
      {
        name: '**Health Status**',
        value: `\`🤒 Is Sick:\` ${petProfile.isSick ? 'Yes' : 'No'}`,
        inline: false,
      },
      //{ name: '**Training Level**', value: `\`🏋️‍♂️ Training:\` ${petProfile.trainingLevel}`, inline: false },
      {
        name: '**Exercise Level**',
        value: `\`🏃 Exercise:\` ${petProfile.exerciseLevel}`,
        inline: false,
      },
      {
        name: '**Education Level**',
        value: `\`🎓 Education:\` ${petProfile.educationLevel}`,
        inline: false,
      }
    )
    .setColor('#9e38fe');
}

function createHealthNeedsEmbed(petProfile, imageUrl) {
  const scaledHealth = petProfile.health.toFixed(2);
  const scaledHunger = petProfile.hunger.toFixed(2);
  const scaledThirst = petProfile.thirst.toFixed(2);
  const scaledCleanliness = petProfile.cleanliness.toFixed(2);
  const scaledEnergy = petProfile.energy.toFixed(2);

  return new EmbedBuilder()
    .setTitle(`${petProfile.petName ? petProfile.petName : 'Unnamed Pet'}'s Health & Needs`)
    .setThumbnail(imageUrl)
    .addFields(
      {
        name: '**Health & Needs**',
        value: `\`❤️ Health:\` ${variables.getHealth(petProfile.health)} (${scaledHealth})\n\`🍽️ Hunger:\` ${variables.getHunger(
          petProfile.hunger
        )} (${scaledHunger})\n\`💧 Thirst:\` ${variables.getThirst(petProfile.thirst)} (${scaledThirst})\n\`🚿 Cleanliness:\` ${variables.getCleanliness(
          petProfile.cleanliness
        )} (${scaledCleanliness})\n\`🔋 Energy:\` ${variables.getEnergy(petProfile.energy)} (${scaledEnergy})`,
        inline: false,
      },
      {
        name: '**Additional Info**',
        value: `\`💊 Medicine Count:\` ${petProfile.medicineCount}\n\`💪 Discipline Level:\` ${petProfile.discipline}`,
        inline: false,
      },
      {
        name: '**Rest & Recovery**',
        value: `\`💤 Sleep Level:\` ${petProfile.sleepLevel}\n\`💊 Last Medicine:\` ${getLastTimeStamp(petProfile.actionTimeStamp.lastMedicine)}`,
        inline: false,
      },
      {
        name: '**Hunting & Play**',
        value: `\`🏹 Hunt Count:\` ${petProfile.huntCount}\n\`🎮 Mini Game Scores:\` coming soon`,
        inline: false,
      }
    )
    .setColor('#9e38fe');
}

function createInteractionsEmbed(petProfile, imageUrl) {
  return new EmbedBuilder()
    .setTitle(`${petProfile.petName}'s Interactions`)
    .setThumbnail(imageUrl)
    .addFields(
      {
        name: '**Interactions**',
        value: `\`👋 Pat Count:\` ${petProfile.patCount}\n\`🤱 Cuddle Count:\` ${petProfile.cuddleCount}\n\`🍽️ Feed Count:\` ${petProfile.feedCount}\n\`🥤 Drink Count:\` ${petProfile.drinkCount}\n\`🫧 Cleaned Count:\` ${petProfile.cleanedCount}`,
        inline: false,
      },
      {
        name: '**Care & Socialisation**',
        value: `\`👩‍⚕️ Vet Visits:\` ${petProfile.vetCount}\n\`🧑‍🤝‍🧑 Friends:\` ${petProfile.socialisation.friends.length}\n\`🏆 Competitions Entered:\` ${petProfile.socialisation.competitionsEntered}`,
        inline: false,
      }
    )
    .setColor('#9e38fe');
}

function getLastTimeStamp(timeStamps) {
  if (!timeStamps || timeStamps.length === 0) return 'Never';
  // Format the timestamp into a readable date string
  return new Date(timeStamps[timeStamps.length - 1]).toLocaleDateString();
}

function generateButtons(currentPageIndex, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`about_previous_${currentPageIndex}`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPageIndex === 0),
    new ButtonBuilder()
      .setCustomId(`about_next_${currentPageIndex}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPageIndex >= totalPages - 1)
  );
}

function petTypeToString(type) {
  const types = { 1: 'Dog', 2: 'Cat', 3: 'Red Panda', 0: 'None' };
  return types[type] || 'Unknown';
}

function lifeStageToString(stage) {
  const stages = { 0: 'Baby', 1: 'Child', 2: 'Teen', 3: 'Adult' };
  return stages[stage] || 'Unknown';
}

module.exports = {
  generateEmbeds,
  createBasicInfoEmbed,
  createHealthNeedsEmbed,
  createInteractionsEmbed,
  generateButtons,
  petTypeToString,
  lifeStageToString,
};
