const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const variables = require("../data/variableNames");

function generateEmbeds(userDb) {
  const baseImageUrl = "https://fjord.au/assets/pawpal";
  const petTypeFolder = userDb.petType === 1 ? "dog" : userDb.petType === 2 ? "cat" : "redpanda";
  const emotionSuffix = userDb.happiness < 30 ? "A" : userDb.happiness <= 60 ? "N" : "H";
  const imageUrl = `${baseImageUrl}/${petTypeFolder}/${petTypeFolder}${emotionSuffix}.png`;

  const basicInfoEmbed = createBasicInfoEmbed(userDb, imageUrl);
  const healthNeedsEmbed = createHealthNeedsEmbed(userDb, imageUrl);
  const interactionsEmbed = createInteractionsEmbed(userDb, imageUrl);
  
  return [basicInfoEmbed, healthNeedsEmbed, interactionsEmbed];
}

function createBasicInfoEmbed(userDb, imageUrl) {
  const scaledAffection = (userDb.affection).toFixed(2);
  const scaledHappiness = (userDb.happiness).toFixed(2);
  const scaledEnergy = (userDb.energy).toFixed(2);

  return new EmbedBuilder()
    .setTitle(`${userDb.petName ? userDb.petName : 'Unnamed Pet'}'s Profile`)
    .setThumbnail(imageUrl)
    .setDescription(
      `**Basic Information**\n` +
      `\`🐾 Pet Type:\` **${petTypeToString(userDb.petType)}**\n` +
      `\`🌟 Life Stage:\` **${lifeStageToString(userDb.lifeStage)}**\n` +
      `\`🎂 Age:\` **${userDb.age}** days old\n` +
      `\`💕 Affection:\` **${variables.getAffection(userDb.affection)}** ||(${scaledAffection}/100.00)||\n` +
      `\`😄 Happiness:\` **${variables.getHappiness(userDb.happiness)}** ||(${scaledHappiness}/100.00)||\n` +
      `\`😴 Energy:\` **${variables.getEnergy(userDb.energy)}** ||(${scaledEnergy}/100.00)||\n` +
      `\`🤒 Is Sick:\` **${userDb.isSick ? 'Yes' : 'No'}**`
    )
    .setColor('#9e38fe');
}

function createHealthNeedsEmbed(userDb, imageUrl) {
  const scaledHealth = (userDb.health).toFixed(2);
  const scaledHunger = (userDb.hunger).toFixed(2);
  const scaledThirst = (userDb.thirst).toFixed(2);
  const scaledCleanliness = (userDb.cleanliness).toFixed(2);
  const scaledEnergy = (userDb.energy).toFixed(2);

  return new EmbedBuilder()
    .setTitle(`${userDb.petName ? userDb.petName : 'Unnamed Pet'}'s Health & Needs`)
    .setThumbnail(imageUrl)
    .setDescription(
         `**Health Information**\n` +
      `\`❤️ Health:\` **${variables.getHealth(userDb.health)}** ||(${scaledHealth}/100.00)||\n` +
      `\`🍽️ Hunger:\` **${variables.getHunger(userDb.hunger)}** ||(${scaledHunger}/100.00)||\n` +
      `\`💧 Thirst:\` **${variables.getThirst(userDb.thirst)}** ||(${scaledThirst}/100.00)||\n` +
      `\`🚿 Cleanliness:\` **${variables.getCleanliness(userDb.cleanliness)}** ||(${scaledCleanliness}/100.00)||\n` +
      `\`🔋 Energy:\` **${variables.getEnergy(userDb.energy)}** ||(${scaledEnergy}/100.00)||\n` +
      `\`💊 Medicine Count:\` **${userDb.medicineCount}**\n` +
      `\`💪 Discipline Level:\` **${userDb.discipline}**`
    )
    .setColor('#9e38fe');
}

function createInteractionsEmbed(userDb, imageUrl) {
  return new EmbedBuilder()
    .setTitle(`${userDb.petName}'s Interactions`)
    .setThumbnail(imageUrl)
    .setDescription(
        `**Interaction Information**\n` +
      `\`👋 Pat Count:\` **${userDb.patCount}**\n` +
      `\`🤱 Cuddle Count:\` **${userDb.cuddleCount}**\n` +
      `\`🍽️ Feed Count:\` **${userDb.feedCount}**\n` +
      `\`🥤 Drink Count:\` **${userDb.drinkCount}**\n` +
      `\`🫧 Cleaned Count:\` **${userDb.cleanedCount}**\n` +
      `\`👩‍⚕️ Vet Visits:\` **${userDb.vetCount}**\n` +
      `\`🧑‍🤝‍🧑 Friends:\` **${userDb.socialisation.friends.length}**\n` +
      `\`🏆 Competitions Entered:\` **${userDb.socialisation.competitionsEntered}**`
    )
    .setColor('#9e38fe');
}

function generateButtons(currentPageIndex, totalPages) {
  return new ActionRowBuilder()
    .addComponents(
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