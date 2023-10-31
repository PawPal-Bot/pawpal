const { Schema, model } = require("mongoose");

const userProfile = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    petName: {
      type: String,
      required: false,
      unique: false,
      default: "",
      maxlength: [25, "Pet name cannot be more than 25 characters"],
    },
    petType: {
      type: Number, // 0 for none selected yet, 1 for dog, 2 for cat, 3 for red panda
      required: true,
      default: 0,
      unique: false,
    },
    hasPet: {
      type: Boolean,
      required: true,
      default: false,
      unique: false,
    },
    petAge: {
      type: Number,
      required: false,
      default: 0,
      unique: false,
    },
    petHappiness: {
      type: Number,
      required: false,
      default: 50, // max 100
      unique: false,
    },
    patCount: {
      type: Number,
      required: false,
      default: 0,
      unique: false,
    },
    patTimestamps: {
      type: [Date],
      default: [],
    },
    petHunger: {
      type: Number,
      required: false,
      default: 50, // max 100
      unique: false,
    },
    feedCount: {
      type: Number,
      default: 0,
    },
    feedTimestamps: {
      type: [Date],
      default: [],
    },
    petCleanliness: {
      type: Number,
      required: false,
      default: 50, // max 100
      unique: false,
    },
    cleanedTimestamps: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model("userProfile", userProfile);
