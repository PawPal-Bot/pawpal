const userModel = require("../util/Models/userModel");
const timeStamp = require("../util/timeStamp");

module.exports = async function valueDrainInterval() {
  console.log("Interval Timer (Value Drain) started");
  try {
    const users = await userModel.find();

    let operations = users.map((user) => {
      let happinessDrainRate = 1;
      let affectionDrainRate = 0.5;

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

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            happiness: Math.max(user.happiness - happinessDrainRate, 0),
            energy: Math.max(user.energy - 1, 0),
            hunger: Math.max(user.hunger - 1, 0),
            thirst: Math.max(user.thirst - 1, 0),
            cleanliness: Math.max(user.cleanliness - 1, 0),
            sleepLevel: Math.max(user.sleepLevel - 1, 0),
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
