const { Schema, model } = require("mongoose");

const userProfile = new Schema(
  {
    userId: { type: Number, required: true, unique: true },
    petName: {
      type: String,
      default: "",
      maxlength: [25, "Pet name cannot be more than 25 characters"],
    },
    petType: { type: Number, default: 0 }, // 0 for none, 1 for dog, 2 for cat, 3 for red panda
    hasPet: { type: Boolean, default: false },
    lifeStage: { type: Number, default: 0 }, // 0 for baby, 1 for child, 2 for teen, 3 for adult
    age: { type: Number, default: 0 },
    health: { type: Number, default: 100 }, // health out of 100
    isSick: { type: Boolean, default: false },
    medicineCount: { type: Number, default: 0 },
    discipline: { type: Number, default: 0 },
    trainingLevel: { type: Number, default: 0 },
    happiness: { type: Number, default: 50 },
    energy: { type: Number, default: 100 },
    hunger: { type: Number, default: 50 },
    thirst: { type: Number, default: 50 },
    cleanliness: { type: Number, default: 50 },
    exerciseLevel: { type: Number, default: 0 },
    sleepLevel: { type: Number, default: 100 },
    educationLevel: { type: Number, default: 0 },
    affection: { type: Number, default: 50 },
    accessories: { type: Array, default: [] },
    housingCustomisations: { type: Array, default: [] },
    miniGameScores: { type: Object, default: {} },
    socialisation: {
      friends: { type: Array, default: [] },
      competitionsEntered: { type: Number, default: 0 },
    },
    actionTimestamps: {
      lastFed: { type: [Date], default: [] },
      lastDrank: { type: [Date], default: [] },
      lastCleaned: { type: [Date], default: [] },
      lastMedicine: { type: [Date], default: [] },
      lastPlayed: { type: [Date], default: [] },
      lastEducated: { type: [Date], default: [] },
      lastWalked: { type: [Date], default: [] },
      lastPat: { type: [Date], default: [] },
    },
    patCount: { type: Number, default: 0 },
    patTimestamps: { type: [Date], default: [] },
    feedCount: { type: Number, default: 0 },
    feedTimestamps: { type: [Date], default: [] },
    drinkCount: { type: Number, default: 0 },
    drinkTimestamps: { type: [Date], default: [] },
    cleanedCount: { type: Number, default: 0 },
    cleanedTimestamps: { type: [Date], default: [] },
  },
  { timestamps: true }
);

module.exports = model("userProfile", userProfile);
