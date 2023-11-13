const petProfile = require("../../schemas/PetModel");
const timeStamp = require("../../utils/timeStamp");

module.exports = async function valueDrainInterval() {
  console.log("Interval Timer (Value Drain) started");
  try {
    const petDb = await petProfile.find(); // Assigning the result of petProfile.find() to petDb

    let operations = petDb.map((pet) => { // Renamed user to pet
      let happinessDrainRate = 3;
      let affectionDrainRate = 3;
      let energyDrainRate = 3;
      let hungerDrainRate = 3;
      let thirstDrainRate = 3;
      let cleanlinessDrainRate = 3;
      let sleepLevelDrainRate = 4;

      const lastVetVisitTime = pet.actionTimeStamp.lastVetVisit?.length
        ? new Date(
            pet.actionTimeStamp.lastVetVisit[
              pet.actionTimeStamp.lastVetVisit.length - 1
            ]
          ).getTime()
        : 0;
      const timeSinceLastVetVisit = Date.now() - lastVetVisitTime;
      const sixHoursPassed = timeSinceLastVetVisit >= timeStamp.sixHours();

      if (pet.isSick && !sixHoursPassed) {
        happinessDrainRate = 6;
        affectionDrainRate = 0;
        energyDrainRate = 0;
        hungerDrainRate = 0;
        thirstDrainRate = 0;
        cleanlinessDrainRate = 0;
        sleepLevelDrainRate = 0;
      } else if (pet.isSick && sixHoursPassed) {
        pet.isSick = false;
      }

      const { actionTimeStamp, petType } = pet;
      if (
        actionTimeStamp.lastPat > timeStamp.twoHoursAgo() ||
        actionTimeStamp.lastCuddled > timeStamp.twoHoursAgo() ||
        actionTimeStamp.lastPlayed > timeStamp.twoHoursAgo() ||
        actionTimeStamp.lastCleaned > timeStamp.twoHoursAgo()
      ) {
        happinessDrainRate /= 2;
        affectionDrainRate /= 2;
      }

      if (petType !== 2) {
        if (
          actionTimeStamp.lastRan > timeStamp.twoHoursAgo() ||
          actionTimeStamp.lastWalked > timeStamp.twoHoursAgo()
        ) {
          happinessDrainRate += 1;
        }
      }

      const now = Date.now();
      
      const sleepUntilTime = pet.sleepUntil ? new Date(pet.sleepUntil).getTime() : null;
      
      const hassleepUntilPassed = sleepUntilTime ? now > sleepUntilTime : false;
      
      if (hassleepUntilPassed) {
        pet.isAsleep = false;
        const lastSleptTime = new Date(pet.actionTimeStamp.lastSlept[0]).getTime();
        const sleepDuration = sleepUntilTime - lastSleptTime;
        const maxSleepDuration = 4 * 60 * 60 * 1000;
        const recoveryPercentage = sleepDuration / maxSleepDuration;
        pet.energy = Math.min(pet.energy + Math.round(recoveryPercentage * 100), 100);
        pet.sleepLevel = Math.min(pet.sleepLevel + Math.round(recoveryPercentage * 100), 100);
      }

      let update = {
        isAsleep: pet.isAsleep, 
        happiness: Math.max(pet.happiness - happinessDrainRate, 0),
        affection: Math.max(pet.affection - affectionDrainRate, 0),
        energy: pet.isSick
          ? pet.energy
          : Math.max(pet.energy - energyDrainRate, 0),
        hunger: pet.isSick
          ? pet.hunger
          : Math.max(pet.hunger - hungerDrainRate, 0),
        thirst: pet.isSick
          ? pet.thirst
          : Math.max(pet.thirst - thirstDrainRate, 0),
        cleanliness: pet.isSick
          ? pet.cleanliness
          : Math.max(pet.cleanliness - cleanlinessDrainRate, 0),
        sleepLevel: pet.isSick
          ? pet.sleepLevel
          : Math.max(pet.sleepLevel - sleepLevelDrainRate, 0),
      };

      if (pet.isSick && sixHoursPassed) {
        update.isSick = false;
      }

      return {
        updateOne: {
          filter: { _id: pet._id },
          update: update,
        },
      };
    });

    await petProfile.bulkWrite(operations); // Changed userModel to petProfile

    console.log(
      `Interval Run Successfully: ${operations.length} pets updated (value drain)`
    );
  } catch (error) {
    console.error("Interval Failed To Run (value drain):", error);
  }
};
