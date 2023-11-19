const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require("../../class/ExtendedClient");
const { WebhookClient } = require("discord.js");

module.exports = {
  event: "guildCreate",
  /**
   *
   * @param {ExtendedClient} client
   * @param {import('discord.js').Guild} guild
   * @returns
   */
  run: async (client, guild) => {
    try {
      const newGuildData = new GuildProfile({
        _id: guild.id,
        guildName: guild.name,
      }, { timestamps: true });

      await newGuildData.save();

      log(`Huzzah! We've joined ${guild.name}. Created new data for ${guild.name} with ID ${guild.id}`, "info");

      const guildActivityWebhookId = process.env.GUILDACTIVITY_WEBHOOK_ID;
      const guildActivityWebhookToken = process.env.GUILDACTIVITY_WEBHOOK_TOKEN;

      if (guildActivityWebhookId && guildActivityWebhookToken) {
        const webhookClient = new WebhookClient({
          id: guildActivityWebhookId,
          token: guildActivityWebhookToken,
        });
        

        const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];
        const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

        const botName = client.user.username;        
        const guildIconURL = guild.iconURL({ dynamic: true, size: 1024 });
        const serverCount = client.guilds.cache.size;
        const messageContent = `:green_circle: ${botName} has joined ${guild.name}. We are now in ${serverCount} servers. ${randomEmoji}`;

    await webhookClient.send({ content: messageContent, username: guild.name, avatarURL: guildIconURL });
      } else {
        log("Guild activity webhook configuration not found.", "error");
      }
    } catch (error) {
      log(`Failed to handle guild create for ${guild.id}: ${error}`, "error");
    }
  },
};