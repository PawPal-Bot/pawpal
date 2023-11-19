const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require("../../class/ExtendedClient");
const { WebhookClient } = require("discord.js");

module.exports = {
  event: "guildDelete",
  /**
   *
   * @param {ExtendedClient} client
   * @param {import('discord.js').Guild} guild
   * @returns
   */
  run: async (client, guild) => {
    try {
      await GuildProfile.findOneAndDelete({ _id: guild.id });

      log(`It appears ${guild.name} removed us. We've deleted all information related to ${guild.name} with ID ${guild.id}`, "info");

      const guildActivityWebhookId = process.env.GUILDACTIVITY_WEBHOOK_ID;
      const guildActivityWebhookToken = process.env.GUILDACTIVITY_WEBHOOK_TOKEN;

      if (guildActivityWebhookId && guildActivityWebhookToken) {
        const webhookClient = new WebhookClient({
          id: guildActivityWebhookId,
          token: guildActivityWebhookToken,
        });

        const botName = client.user.username;
        const guildIconURL = guild.iconURL({ dynamic: true, size: 1024 });
        const serverCount = client.guilds.cache.size;
        const messageTitle = `${botName} has left ${guild.name}`;
        const messageContent = `:red_circle: ${messageTitle}. We are now in ${serverCount} servers.`;

    await webhookClient.send({ content: messageContent, username: guild.name, avatarURL: guildIconURL });
      } else {
        log("Guild activity webhook configuration not found.", "error");
      }
    } catch (error) {
      log(`Failed to handle guild delete for ${guild.id}: ${error}`, "error");
    }
  },
};
