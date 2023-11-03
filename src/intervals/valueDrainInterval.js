const userModel = require("../util/Models/userModel");
const timeStamp = require("../util/timeStamp");

module.exports = async function valueDrainInterval() {
  console.log("Interval Timer (Value Drain) started");
  try {
    const users = await userModel.find();

    let operations = users.map((user) => {
      let happinessDrainRate = 3;
      let affectionDrainRate = 3;
      let energyDrainRate = 3;
      let hungerDrainRate = 3;
      let thirstDrainRate = 3;
      let cleanlinessDrainRate = 3;
      let sleepLevelDrainRate = 4;

      const lastVetVisitTime = user.actionTimeStamp.lastVetVisit?.length
        ? new Date(
            user.actionTimeStamp.lastVetVisit[
              user.actionTimeStamp.lastVetVisit.length - 1
            ]
          ).getTime()
        : 0;
      const timeSinceLastVetVisit = Date.now() - lastVetVisitTime;
      const sixHoursPassed = timeSinceLastVetVisit >= timeStamp.sixHours();

      if (user.isSick && !sixHoursPassed) {
        happinessDrainRate = 6;
        affectionDrainRate = 0;
        energyDrainRate = 0;
        hungerDrainRate = 0;
        thirstDrainRate = 0;
        cleanlinessDrainRate = 0;
        sleepLevelDrainRate = 0;
      } else if (user.isSick && sixHoursPassed) {
        user.isSick = false;
      }

      const { actionTimeStamp, petType } = user;
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

      let update = {
        happiness: Math.max(user.happiness - happinessDrainRate, 0),
        affection: Math.max(user.affection - affectionDrainRate, 0),
        energy: user.isSick
          ? user.energy
          : Math.max(user.energy - energyDrainRate, 0),
        hunger: user.isSick
          ? user.hunger
          : Math.max(user.hunger - hungerDrainRate, 0),
        thirst: user.isSick
          ? user.thirst
          : Math.max(user.thirst - thirstDrainRate, 0),
        cleanliness: user.isSick
          ? user.cleanliness
          : Math.max(user.cleanliness - cleanlinessDrainRate, 0),
        sleepLevel: user.isSick
          ? user.sleepLevel
          : Math.max(user.sleepLevel - sleepLevelDrainRate, 0),
      };

      if (user.isSick && sixHoursPassed) {
        update.isSick = false;
      }

      return {
        updateOne: {
          filter: { _id: user._id },
          update: update,
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
