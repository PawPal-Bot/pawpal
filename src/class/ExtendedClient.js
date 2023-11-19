const { Client, Partials, Collection, GatewayIntentBits, LimitedCollection } = require("discord.js");
const { log } = require("../functions/index");
const config = require("../config");
const commands = require("../handlers/commands");
const events = require("../handlers/events");
const deploy = require("../handlers/deploy");
const mongoose = require("../handlers/mongoose");
const components = require("../handlers/components");
const PetModel = require("../schemas/PetModel");
const timeStamp = require("../utils/timeStamp");

module.exports = class extends Client {
  collection = {
    interactioncommands: new Collection(),
    prefixcommands: new Collection(),
    aliases: new Collection(),
    components: {
      buttons: new Collection(),
      selects: new Collection(),
      modals: new Collection(),
    },
  };
  applicationcommandsArray = [];

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages],
      partials: [Partials.Reaction],
      makeCache: manager => {
        switch (manager.name) {
          case "ThreadMemberManager":
          case "ApplicationCommandManager":
          case "BaseGuildEmojiManager":
          case "GuildEmojiManager":
          case "GuildInviteManager":
          case "GuildStickerManager":
          case "StageInstanceManager":
          case "PresenceManager":
          case "MessageManager":
          case "GuildBanManager":
          case "ThreadManager":
          case "ReactionUserManager":
          case "VoiceStateManager":
          case "AutoModerationRuleManager":
            return new LimitedCollection({ maxSize: 0 });
          case "GuildMemberManager":
            return new LimitedCollection({
              maxSize: 20000,
              keepOverLimit: member => member.id === member.client.user.id,
            });
          case "UserManager":
            return new LimitedCollection({
              maxSize: 20000,
              keepOverLimit: user => user.id === user.client.user.id,
            });
          default:
            return new Collection();
        }
      },
    });
  }

  start = async () => {
    commands(this);
    events(this);
    components(this);

    if (config.handler.mongodb.toggle) await mongoose();

    await this.login(process.env.CLIENT_TOKEN);

    if (config.handler.deploy) deploy(this, config);

    this.setBotPresence();

    setInterval(() => this.setBotPresence(), timeStamp.oneHour());
  };

  setBotPresence = async () => {
    try {
      const totalPets = await PetModel.countDocuments();
      await this.user.setActivity(`Enjoying a lovely day in the park with ${totalPets} furry friends`, { type: 4 });
      log(`Activity updated: ${totalPets} furry friends`, "done");
    } catch (error) {
      log(`Error updating bot activity: ${error}`, "err");
    }
  };
};
