const userModel = require("../util/Models/userModel");

module.exports = async function ageUpdateInterval() {
  console.log("Interval Timer (Age and Life Stage Update) started");
  try {
    const users = await userModel.find();
    let updatedCount = 0;

    let operations = users.map((user) => {
      const ageInHours =
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
      user.age = Math.floor(ageInHours / 24);

      if (user.age >= 120) {
        user.lifeStage = 3; // Adult
      } else if (user.age >= 90) {
        user.lifeStage = 2; // Teen
      } else if (user.age >= 30) {
        user.lifeStage = 1; // Child
      } else {
        user.lifeStage = 0; // Baby
      }

      return {
        updateOne: {
          filter: { _id: user._id },
          update: { age: user.age, lifeStage: user.lifeStage },
        },
      };
    });

    await userModel.bulkWrite(operations);

    updatedCount = operations.length;

    console.log(
      `Interval Run Successfully: ${updatedCount} pets updated (age and life stage update)`
    );
  } catch (error) {
    console.error("Interval Failed To Run (age and life stage update):", error);
  }
};
