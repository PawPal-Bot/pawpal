const userModel = require("../util/Models/userModel");
const timeStamp = require("../util/timeStamp");

module.exports = async function valueDrainInterval() {
  console.log("Interval Timer (Value Drain) started");
  try {
    const users = await userModel.find();

    let operations = users.map((user) => {
      let happinessDrainRate = 1;
      let affectionDrainRate = 0.5;
      let energyDrainRate = 1;
      let hungerDrainRate = 1;
      let thirstDrainRate = 1;
      let cleanlinessDrainRate = 1;
      let sleepLevelDrainRate = 1;

      // Check action timestamps and adjust drain rates
      const { actionTimestamps, petType } = user;
      if (
        actionTimestamps.lastPat > timeStamp.twoHoursAgo ||
        actionTimestamps.lastCuddled > timeStamp.twoHoursAgo ||
        actionTimestamps.lastPlayed > timeStamp.twoHoursAgo ||
        actionTimestamps.lastCleaned > timeStamp.twoHoursAgo
      ) {
        happinessDrainRate /= 2;
        affectionDrainRate /= 2;
      }

      if (petType !== 2) {
        // if the pet is not a cat, increase values. if it is a cat, decrease values further.
        if (
          actionTimestamps.lastRan > timeStamp.twoHoursAgo ||
          actionTimestamps.lastWalk > timeStamp.twoHoursAgo
        ) {
          happinessDrainRate += 1;
        }
      }

      // if pets cleanliness is less than 25 and greater than 1, there is a 50% chance of becoming sick
      if (user.cleanliness < 25 && user.cleanliness > 1) {
        const randomChance = Math.random();
        if (randomChance < 0.5) {
          user.isSick = true;
        }
      }

      // if the pet is sick, increase the drain rates
      if (user.isSick) {
        happinessDrainRate = 6;
        affectionDrainRate = 6;
        energyDrainRate = 6;
        healthDrainRate = 6;
        hungerDrainRate = 6;
        thirstDrainRate = 6;
        cleanlinessDrainRate = 6;
      }

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            happiness: Math.max(user.happiness - happinessDrainRate, 0),
            energy: Math.max(user.energy - energyDrainRate, 0),
            hunger: Math.max(user.hunger - hungerDrainRate, 0),
            thirst: Math.max(user.thirst - thirstDrainRate, 0),
            cleanliness: Math.max(user.cleanliness - cleanlinessDrainRate, 0),
            sleepLevel: Math.max(user.sleepLevel - sleepLevelDrainRate, 0),
            affection: Math.max(user.affection - affectionDrainRate, 0),
          },
        },
      };
    });

    await userModel.bulkWrite(operations);

    console.log(
      `Interval Run Successfully: ${operations.length} pets updated (value drain)`
    );
  } catch (error) {
    console.error("Interval Failed To Run (value drain):", error);
  }
};
