const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require("../../class/ExtendedClient");
const { EmbedBuilder, WebhookClient } = require("discord.js");

module.exports = {
  event: "guildDelete",
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Guild} guild
   * @returns
   */
  run: async (_, guild) => {
    try {
      await GuildProfile.findOneAndDelete({ _id: guild.id });

      log(
        `It appears ${guild.name} removed us. We've deleted all information related to ${guild.name} with ID ${guild.id}`,
        "info"
      );

      // Retrieve the ID and token from environment variables
      const guildActivityWebhookId = process.env.GUILDACTIVITY_WEBHOOK_ID;
      const guildActivityWebhookToken = process.env.GUILDACTIVITY_WEBHOOK_TOKEN;

      // Check if both ID and token are available
      if (guildActivityWebhookId && guildActivityWebhookToken) {
        // Create a new WebhookClient using the ID and token
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
          .setColor(0xff0000)
          .setTitle("Guild Left!")
          .setDescription(`Bot has left ${guild.name}`)
          .addFields(guildInfo)
          .setTimestamp();

        await webhookClient.send({ embeds: [embed] });
      } else {
        console.error("Guild activity webhook configuration not found.");
      }
    } catch (error) {
      log(`Failed to handle guild delete for ${guild.id}: ${error}`, "error");
    }
  },
};
