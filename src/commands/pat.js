const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Pat your pet!"),

  async execute(interaction, client) {
    await interaction.deferReply();

    const userDb = await userModel.findOne({ userId: interaction.user.id });

    if (!userDb || userDb.petType === 0) {
      await interaction.editReply("You don't have a pet to pat!");
      return;
    }

    if (userDb.petHappiness >= 100) {
      await interaction.editReply("Your pet can't get any happier!");
      return;
    }

    const petTypeStr = ["none", "dog", "cat", "redPanda"][userDb.petType];
    const randomSound =
      speechBubbles[petTypeStr][
        Math.floor(Math.random() * speechBubbles[petTypeStr].length)
      ];

    const patEmbed = new EmbedBuilder()
      .setColor("#9e38fe")
      .setTitle("Pat your pet!")
      .setDescription(`${randomSound}! Give your pet some love.`)
      .setFooter({ text: `Happiness: ${userDb.petHappiness}/100` })
      .setTimestamp();

    const patButton = new ButtonBuilder()
      .setCustomId("pat")
      .setLabel("Pat")
      .setStyle("Primary");

    await interaction.editReply({
      embeds: [patEmbed],
      components: [new ActionRowBuilder().addComponents(patButton)],
    });
  },
};
