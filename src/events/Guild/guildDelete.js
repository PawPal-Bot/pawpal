const { log } = require("../../functions");
const GuildProfile = require("../../schemas/GuildSchema");
const ExtendedClient = require("../../class/ExtendedClient");
const { WebhookClient, EmbedBuilder } = require("discord.js");

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

      const publicGuildActivityWebhookId = process.env.PUBLIC_GUILDACTIVITY_WEBHOOK_ID;
      const publicGuildActivityWebhookToken = process.env.PUBLIC_GUILDACTIVITY_WEBHOOK_TOKEN;

      const privateGuildActivityWebhookId = process.env.PRIVATE_GUILDACTIVITY_WEBHOOK_ID;
      const privateGuildActivityWebhookToken = process.env.PRIVATE_GUILDACTIVITY_WEBHOOK_TOKEN;

      if ((publicGuildActivityWebhookId && publicGuildActivityWebhookToken) || (privateGuildActivityWebhookId && privateGuildActivityWebhookToken)) {
        const webhookClient = new WebhookClient({
          id: publicGuildActivityWebhookId,
          token: publicGuildActivityWebhookToken,
        });

        let features;
        if ((guild.features && guild.features.includes("VERIFIED")) || guild.features.includes("PARTNERED")) {
          features = guild.features.includes("VERIFIED") ? `<:verified:1175768226743975986> ` : `<:partnered:1175768227901620254>`;
        }

        const botName = client.user.username;
        const guildIconURL = guild.iconURL({ dynamic: true, size: 1024 });
        const serverCount = client.guilds.cache.size;
        const messageTitle = `${botName} has left ${guild.name}`;
        const messageContent = `:red_circle: ${messageTitle} ${features}. We are now in ${serverCount} servers.`;

        await webhookClient.send({ content: messageContent, username: guild.name, avatarURL: guildIconURL, allowedMentions: { parse: [] } });

        const privateWebhook = new WebhookClient({
          id: privateGuildActivityWebhookId,
          token: privateGuildActivityWebhookToken,
        });

        const privateEmbed = new EmbedBuilder()
          .setTitle(`→ Left Server`)
          .setColor("#dd2e44")
          .setThumbnail(
            guild.iconURL({
              extension: "png",
            })
          )
          .setDescription(`**Name**: ${guild.name}\n**Users**: ${guild.memberCount.toLocaleString()}${features ? `\n**Features**: ${features}` : ``}`)
          .setFooter({
            text: `PawPal is now in ${client.guilds.cache.size.toLocaleString()} Servers`,
          });

        await privateWebhook.send({ embeds: [privateEmbed], username: "PawPal - Server Logs", avatarURL: client.user.avatarURL(), allowedMentions: { parse: [] } });
      } else {
        log("Guild activity webhook configuration not found.", "error");
      }
    } catch (error) {
      log(`Failed to handle guild delete for ${guild.id}: ${error}`, "error");
    }
  },
};
