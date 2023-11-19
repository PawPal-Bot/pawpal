const ExtendedClient = require("../../class/ExtendedClient");
const { EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionFlagsBits,
} = require("discord.js");


module.exports = {
    event: "messageCreate",
    /**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Client<true>} client
     * @returns
     */
    run: async (client, message) => {

        if (
            message.guild?.members.me &&
            (message?.channel)
                ?.permissionsFor(message.guild.members.me)
                ?.has([
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                ])
        ) {

            const supportEmbed = new EmbedBuilder()
                .setAuthor({
                    name: "Hello, my name is PawPal",
                    iconURL:
                        "https://cdn.discordapp.com/emojis/953349395955470406.gif?size=40&quality=lossless",
                })
                .setDescription(
                    `Im a bot designed for you to raise a lovable red panda, a playful dog, or an adorable cat in this interactive Discord pet bot. \n\n You can use </get started:1169775163085164565> to adopt a pet! `,
                )
                .setColor("#9a39f3");

            const supportButton =
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Invite")
                        .setStyle(5)
                        .setEmoji("📋")
                        .setURL(
                            "https://discord.com/oauth2/authorize?client_id=1135244742339334256&permissions=2147863616&scope=bot%20applications.commands",
                        ),
                    new ButtonBuilder()
                        .setLabel("Support")
                        .setStyle(5)
                        .setEmoji("❤️")
                        .setURL("https://discord.gg/https://discord.gg/zB98fPdRTp"),
                );


            if (
                message.content &&
                new RegExp(`^(<@!?${client?.user?.id}>)`).test(message.content)
            )
                message.channel
                    .send({
                        embeds: [supportEmbed],
                        components: [supportButton],
                    })
                    .catch((err) => {
                        captureException(err);
                    });
            return;
        }
    },
};
