const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require("../../class/ExtendedClient");
const { EmbedBuilder, WebhookClient } = require("discord.js");

module.exports = {
  event: "guildCreate",
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Guild} guild
   * @returns
   */
  run: async (_, guild) => {
    try {
      const newGuildData = new GuildProfile(
        {
          _id: guild.id,
          guildName: guild.name,
        },
        { timestamps: true }
      );

      await newGuildData.save();

      log(
        `Huzzah! We've joined ${guild.name}. Created new data for ${guild.name} with ID ${guild.id}`,
        "info"
      );

      const guildActivityWebhookId = process.env.GUILDACTIVITY_WEBHOOK_ID;
      const guildActivityWebhookToken = process.env.GUILDACTIVITY_WEBHOOK_TOKEN;

      if (guildActivityWebhookId && guildActivityWebhookToken) {
        const webhookClient = new WebhookClient({
          id: guildActivityWebhookId,
          token: guildActivityWebhookToken,
        });

        const guildInfo = {
          name: guild.name || "Unknown",
          value: `**ID:** ${guild.id}\n**Owner:** ${
            guild.ownerId ? `<@${guild.ownerId}>` : "Unknown"
          }\n**Members:** ${guild.memberCount || "Unknown"}`,
        };

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("New Guild Joined!")
          .setDescription(`Bot has joined ${guild.name}`)
          .addFields(guildInfo)
          .setTimestamp();

        await webhookClient.send({ embeds: [embed] });
      } else {
        console.error("Guild activity webhook configuration not found.");
      }
    } catch (error) {
      log(`Failed to create data for guild ID ${guild.id}: ${error}`, "error");
    }
  },
};
