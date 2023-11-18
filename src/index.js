require("dotenv").config();
const ExtendedClient = require("./class/ExtendedClient");
const startIntervals = require("./utils/intervals/startInvervals");

const client = new ExtendedClient();

client.start();
startIntervals();

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
