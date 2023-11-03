const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { readdirSync } = require("fs");
const { ChalkAdvanced } = require("chalk-advanced");
const userDB = require("../util/Models/userModel");
const { ActivityTypes } = require("discord.js");

module.exports = async (client) => {
  const commandFiles = readdirSync("./src/commands/").filter((file) =>
    file.endsWith(".js")
  );

  const commands = [];

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  }

  const rest = new REST({
    version: "10",
  }).setToken(process.env.TOKEN);

  const registerCommands = async () => {
    try {
      if (process.env.STATUS === "PRODUCTION") {
        await rest.put(Routes.applicationCommands(client.user.id), {
          body: commands,
        });
        console.log(
          `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
            ">"
          )} ${ChalkAdvanced.green(
            "Successfully registered commands globally"
          )}`
        );
      } else {
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
          {
            body: commands,
          }
        );

        console.log(
          `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
            ">"
          )} ${ChalkAdvanced.green("Successfully registered commands locally")}`
        );
      }
    } catch (err) {
      if (err && err.request && err.response) {
        console.error(
          `HTTP error: ${err.response.status} ${err.response.statusText}`
        );
      } else {
        console.error(err);
      }
    }
  };

  await registerCommands();

  const totalUsers = await userDB.countDocuments();
  const totalPets = await userDB.countDocuments({ hasPet: true });

  const setStatus = () => {
    if (!client.user) return;
  client.user.setPresence({
    activities: [
      { name: `${totalUsers} users keep ${totalPets} pets`, type: 3 },
      { name: `Enjoying a lovely day in the park with ${totalPets} furry friends`, type: 4, emoji: '🐶'},
    ],
    status: 'online',
  });
  };

  setTimeout(() => setStatus(), 35 * 10);
  setInterval(() => setStatus(), 60 * 60 * 1000);

};
