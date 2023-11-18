const { ModalSubmitInteraction, WebhookClient, EmbedBuilder, Colors } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "dev-support-modal",
  /**
   * @param {ExtendedClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    const guildName = interaction.fields.getTextInputValue("guild_name_input");
    const guildId = interaction.fields.getTextInputValue("guild_id_input");
    const issue = interaction.fields.getTextInputValue("issue_input");
    const email = interaction.fields.getTextInputValue("email_input");

    const supportWebhookId = process.env.SUPPORT_WEBHOOK_ID;
    const supportWebhookToken = process.env.SUPPORT_WEBHOOK_TOKEN;

    if (supportWebhookId && supportWebhookToken) {
      const webhookClient = new WebhookClient({ id: supportWebhookId, token: supportWebhookToken });

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle("New Support Request")
        .setDescription(`**Guild Name:** ${guildName}\n**Guild ID:** ${guildId}\n**Issue:** ${issue}\n**Email:** ${email}`)
        .setTimestamp();

      await webhookClient.send({ embeds: [embed] });
      await interaction.reply({ content: "Thank you for submitting your request. Our team will get back to you shortly.", ephemeral: true });
    } else {
      console.error("Support webhook configuration not found.");
      await interaction.reply({ content: "There was an error submitting your request. Please try again later.", ephemeral: true });
    }
  },
};
