const { REST, Routes } = require("discord.js");
const { log } = require("../functions");
const config = require("../config");
const ExtendedClient = require("../class/ExtendedClient");

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = async client => {
  const getClientID = token => {
    const parsedToken = token.split(".")[0];
    const base64Token = Buffer.from(parsedToken, "base64");
    const userID = base64Token.toString("utf-8");
    return userID;
  };

  const clientID = getClientID(process.env.CLIENT_TOKEN);

  const rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN);

  try {
    log("Started loading application commands... (this might take minutes!)", "info");

    if (process.env.DEVELOPMENT === "true") {
      // Setting commands as guild-specific
      await rest.put(Routes.applicationGuildCommands(clientID, process.env.GUILD_ID), {
        body: client.applicationcommandsArray,
      });
      log(`Successfully loaded application commands to Guild ID: ${process.env.GUILD_ID}`, "done");
    } else {
      // Setting commands as global
      await rest.put(Routes.applicationCommands(clientID), {
        body: client.applicationcommandsArray,
      });
      log("Successfully loaded application commands to Discord API.", "done");
    }
  } catch (e) {
    log("Unable to load application commands to Discord API.", "err");
  }
};
