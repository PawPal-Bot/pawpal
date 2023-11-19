const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require("../../class/ExtendedClient");
const { AutoPoster } = require('topgg-autoposter')

module.exports = {
  event: "ready",
  once: true,
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Client<true>} client
   * @returns
   */
  run: async (_, client) => {
    try {
      const guilds = Array.from(client.guilds.cache.values());

      for (const guild of guilds) {
        if (!guild || !guild.id || guild.id === "null") {
          log(`Skipping guild with null or invalid ID: ${guild ? guild.name : "Unknown"}`, "info");
          continue;
        }

        try {
          const existingGuildData = await GuildProfile.findById(guild.id);

          if (existingGuildData) {
            existingGuildData.memberCount = guild.memberCount;
            await existingGuildData.save();
          } else {
            const newGuildData = new GuildProfile(
              {
                _id: guild.id,
                guildName: guild.name,
                memberCount: guild.memberCount,
              },
              { timestamps: true }
            );

            await newGuildData.save();
          }
        } catch (error) {
          log(`Error processing guild ID ${guild.id}: ${error}`, "err");
        }
      }

      const poster = AutoPoster(process.env.TOPGG_TOKEN, client)

      poster.on('posted', (stats) => { 
        log(`Posted stats to Top.gg | ${stats.serverCount} servers`, "done")
      })

      log("Logged in as: " + client.user.tag, "done");
      log(`Updated or created guild profiles for all valid guilds.`, "done");
    } catch (error) {
      log(`Error creating/updating guild profile documents: ${error}`, "err");
    }
  },
};
