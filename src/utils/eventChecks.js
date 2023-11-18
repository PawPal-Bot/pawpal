const timeStamp = require("../utils/timeStamp");
const petProfile = require("../schemas/PetModel");

async function checkPetStatus(interaction, petName, now) {
  try {
    const petDb = await petProfile.findOne({ userId: interaction.user.id });

    if (!petDb) {
      await interaction.reply("Could not find the pet's data.");
      return false;
    }

    const lastVetVisitTime = petDb.actionTimeStamp.lastVetVisit?.length ? new Date(petDb.actionTimeStamp.lastVetVisit[petDb.actionTimeStamp.lastVetVisit.length - 1]).getTime() : 0;
    const timeSinceLastVetVisit = now - lastVetVisitTime;

    if (petDb.isSick && timeSinceLastVetVisit < timeStamp.sixHours()) {
      const remainingHours = Math.ceil((timeStamp.sixHours() - timeSinceLastVetVisit) / (60 * 60 * 1000));
      await interaction.reply(`${petName} is currently at the vet and needs to rest for another ${remainingHours} hour(s). Please wait before engaging in more activities.`);
      return false;
    }

    const sleepUntilTime = petDb.sleepUntil ? new Date(petDb.sleepUntil).getTime() : null;

    if (petDb.isAsleep && sleepUntilTime && now < sleepUntilTime) {
      const lastSleptTime = new Date(petDb.actionTimeStamp.lastSlept[0]).getTime();
      const actualSleepDuration = now - lastSleptTime;

      const maxSleepDuration = 4 * 60 * 60 * 1000;
      const actualRecoveryPercentage = actualSleepDuration / maxSleepDuration;

      const actualEnergyGain = Math.round(actualRecoveryPercentage * 100);
      const actualSleepLevelGain = Math.round(actualRecoveryPercentage * 100);

      petDb.energy = Math.min(petDb.energy + actualEnergyGain, 100);
      petDb.sleepLevel = Math.min(petDb.sleepLevel + actualSleepLevelGain, 100);

      petDb.energy = Math.max(petDb.energy - 5, 0);
      petDb.sleepLevel = Math.max(petDb.sleepLevel - 5, 0);

      petDb.isAsleep = false;
      petDb.sleepUntil = null;

      await petDb.save();

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(`${StringpetName} was woken up from their slumber and is a bit groggy. Energy, happiness, and sleep level have decreased slightly.`);
      } else {
        await interaction.reply(`${petName} was woken up from their slumber and is a bit groggy. Energy, happiness, and sleep level have decreased slightly.`);
      }
      return false;
    }

    const hasSleepUntilPassed = sleepUntilTime ? now > sleepUntilTime : false;

    if (hasSleepUntilPassed) {
      petDb.isAsleep = false;
      petDb.sleepUntil = null;
      await petDb.save();
    } else if (petDb.isAsleep) {
      petDb.energy = Math.max(petDb.energy - petDb.energy * 0.05, 0);
      petDb.happiness = Math.max(petDb.happiness - petDb.happiness * 0.05, 0);
      petDb.sleepLevel = Math.max(petDb.sleepLevel - petDb.sleepLevel * 0.05, 0);

      petDb.isAsleep = false;
      petDb.sleepUntil = null;

      await petDb.save();

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(`${petName} was woken up from their slumber and is a bit groggy. Energy, happiness, and sleep level have decreased slightly.`);
      } else {
        await interaction.reply(`${petName} was woken up from their slumber and is a bit groggy. Energy, happiness, and sleep level have decreased slightly.`);
      }
      return false;
    }

    return true;
  } catch (error) {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp("An error occurred while updating your pet's status.");
    } else {
      await interaction.reply("An error occurred while updating your pet's status.");
    }
    console.error("Failed to save pet status:", error);
    return false;
  }
}

module.exports = checkPetStatus;
