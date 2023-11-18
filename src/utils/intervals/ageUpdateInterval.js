const petProfile = require("../../schemas/PetModel");
const { log } = require("../../functions");

module.exports = async function ageUpdateInterval() {
  log("Interval Timer (Age and Life Stage Update) started", "done");
  try {
    const petDb = await petProfile.find();
    let updatedCount = 0;

    let operations = petDb.map(pet => {
      if (pet.createdAt instanceof Date && !isNaN(pet.createdAt)) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - pet.createdAt.getTime();
        const daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
        pet.age = daysElapsed; // Set age to the number of days elapsed since createdAt
      } else {
        console.warn(`Pet profile ${pet._id} has missing or invalid 'createdAt'. Skipping.`);
      }

      // Determine the life stage based on age
      if (pet.age >= 120) {
        pet.lifeStage = 3; // Adult
      } else if (pet.age >= 90) {
        pet.lifeStage = 2; // Teen
      } else if (pet.age >= 30) {
        pet.lifeStage = 1; // Child
      } else {
        pet.lifeStage = 0; // Baby
      }

      return {
        updateOne: {
          filter: { _id: pet._id },
          update: {
            age: pet.age,
            lifeStage: pet.lifeStage,
          },
        },
      };
    });

    await petProfile.bulkWrite(operations);

    updatedCount = operations.length;

    log(`Interval Run Successfully: ${updatedCount} pets updated (age and life stage update)`, "done");
  } catch (error) {
    console.error("Interval Failed To Run (age and life stage update):", error);
  }
};
