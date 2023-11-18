const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema(
  {
    _id: String,
    guildName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("guildProfile", guildSchema);
