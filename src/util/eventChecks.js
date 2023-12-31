const timeStamp = require("../util/timeStamp");

async function checkPetStatus(interaction, userDb, petName, now) {
  try {
    const lastVetVisitTime = userDb.actionTimeStamp.lastVetVisit?.length
      ? new Date(
          userDb.actionTimeStamp.lastVetVisit[
            userDb.actionTimeStamp.lastVetVisit.length - 1
          ]
        ).getTime()
      : 0;
    const timeSinceLastVetVisit = now - lastVetVisitTime;

    if (userDb.isSick && timeSinceLastVetVisit < timeStamp.sixHours()) {
      const remainingHours = Math.ceil(
        (timeStamp.sixHours() - timeSinceLastVetVisit) / (60 * 60 * 1000)
      );
      await interaction.reply(
        `${petName} is currently at the vet and needs to rest for another ${remainingHours} hour(s). Please wait before engaging in more activities.`
      );
      return false;
    }

    const sleepUntilTime = userDb.sleepUntil ? new Date(userDb.sleepUntil).getTime() : null;
    
    if (userDb.isAsleep && (sleepUntilTime && now < sleepUntilTime)) {
      const lastSleptTime = new Date(userDb.actionTimeStamp.lastSlept[0]).getTime();
      const actualSleepDuration = now - lastSleptTime;

      const maxSleepDuration = 4 * 60 * 60 * 1000; 
      const actualRecoveryPercentage = (actualSleepDuration / maxSleepDuration);
      
      const actualEnergyGain = Math.round(actualRecoveryPercentage * 100);
      const actualSleepLevelGain = Math.round(actualRecoveryPercentage * 100);
      
      userDb.energy = Math.min(userDb.energy + actualEnergyGain, 100);
      userDb.sleepLevel = Math.min(userDb.sleepLevel + actualSleepLevelGain, 100);

      userDb.energy = Math.max(userDb.energy - 5, 0);
      userDb.sleepLevel = Math.max(userDb.sleepLevel - 5, 0);

      userDb.isAsleep = false;
      userDb.sleepUntil = null;

      await userDb.save();

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(
          `${petName} was woken up early from their slumber and is a bit groggy. Energy and sleep level have decreased due to the interrupted sleep.`
        );
      } else {
        await interaction.reply(
          `${petName} was woken up early from their slumber and is a bit groggy. Energy and sleep level have decreased due to the interrupted sleep.`
        );
      }
      return false;
    }
    
    const hasSleepUntilPassed = sleepUntilTime ? now > sleepUntilTime : false;

    if (hasSleepUntilPassed) {
      userDb.isAsleep = false;
      userDb.sleepUntil = null;
      await userDb.save();
    } else if (userDb.isAsleep) {
      userDb.energy = Math.max(userDb.energy - userDb.energy * 0.05, 0);
      userDb.happiness = Math.max(
        userDb.happiness - userDb.happiness * 0.05,
        0
      );
      userDb.sleepLevel = Math.max(
        userDb.sleepLevel - userDb.sleepLevel * 0.05,
        0
      );

      userDb.isAsleep = false;
      userDb.sleepUntil = null;

      await userDb.save();

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(
          `${petName} was woken up from their slumber and is a bit groggy. Energy, happiness, and sleep level have decreased slightly.`
        );
      } else {
        await interaction.reply(
          `${petName} was woken up from their slumber and is a bit groggy. Energy, happiness, and sleep level have decreased slightly.`
        );
      }
      return false;
    }

    return true;
  } catch (error) {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(
        "An error occurred while updating your pet's status."
      );
    } else {
      await interaction.reply(
        "An error occurred while updating your pet's status."
      );
    }
    console.error("Failed to save pet status:", error);
    return false;
  }
}

module.exports = checkPetStatus;
