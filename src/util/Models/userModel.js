const { Schema, model } = require('mongoose');

const userProfile = new Schema(
    {
        userId: {
            type: Number,
            required: true,
            unique: true,
        },
        petName: {
            type: String,
            required: true,
            unique: false
        },
        petType: {
            type: Number, // 0 for none selected yet, 1 for dog, 2 for cat, 3 for red panda
            required: false,
            default: 0,
            unique: false
        },
        hasPet: {
            type: Boolean,
            required: true,
            default: false,
            unique: false
        },
        feedAgainAt: {
            type: Date,
            required: false,
            default: Date.now(),
            unique: false
        },
        petAgingAt: {
            type: Date,
            required: false,
            default: Date.now(),
            unique: false
        },
    },
    { timestamps: true },
);

module.exports = model('userProfile', userProfile);
