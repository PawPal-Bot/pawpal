const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userProfile = new Schema(
  {
    userId: { type: Number, required: true, unique: true },
    petId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
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
    huntCount: { type: Number, default: 0 },
    sleepLevel: { type: Number, default: 100 },
    isAsleep: { type: Boolean, default: false },
    sleepuntil: { type: Date, default: null },
    educationLevel: { type: Number, default: 0 },
    affection: { type: Number, default: 50 },
    miniGameScores: { type: Object, default: {} },
    patCount: { type: Number, default: 0 },
    cuddleCount: { type: Number, default: 0 },
    feedCount: { type: Number, default: 0 },
    drinkCount: { type: Number, default: 0 },
    cleanedCount: { type: Number, default: 0 },
    vetCount: { type: Number, default: 0 },
    socialisation: {
      friends: { type: Array, default: [] },
      competitionsEntered: { type: Number, default: 0 },
    },
    accessories: { type: Array, default: [] },
    housingCustomisations: { type: Array, default: [] },
    actionTimeStamp: {
      lastFed: { type: [Date], default: [] },
      lastDrank: { type: [Date], default: [] },
      lastCleaned: { type: [Date], default: [] },
      lastGroomed: { type: [Date], default: [] },
      lastMedicine: { type: [Date], default: [] },
      lastPlayed: { type: [Date], default: [] },
      lastEducated: { type: [Date], default: [] },
      lastRan: { type: [Date], default: [] },
      lastWalked: { type: [Date], default: [] },
      lastPat: { type: [Date], default: [] },
      lastCuddled: { type: [Date], default: [] },
      lastVetVisit: { type: [Date], default: [] },
      lastSlept: { type: [Date], default: [] },
      lastHunted: { type: [Date], default: [] },
    },
  },
  { timeStamp: true }
);

module.exports = model("userProfile", userProfile);
