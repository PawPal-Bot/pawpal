// Main Bot Library's
const {
  Client,
  GatewayIntentBits,
  Options,
  Collection,
} = require("discord.js");

const ChalkAdvanced = require("chalk-advanced");

require("dotenv").config();

const DatabaseHandler = require("./databaseHandler");
const EventHandler = require("./eventLoader");

module.exports = class PawPal extends Client {
  constructor(customCacheOptions = {}) {
    super({
      intents: [
        GatewayIntentBits.Guilds
      ],
      makeCache: Options.cacheWithLimits({
        BaseGuildEmojiManager: 0,
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildStickerManager: 0,
        PresenceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        CategoryChannelChildManager: 0,
        MessageManager: 0,
        ReactionManager: 0,
        ...customCacheOptions,
      }),
    });

    this.commands = new Collection();

    this.eventHandler = new EventHandler(this);
    this.eventHandler.load();

    // Start the database
    this.database = new DatabaseHandler(process.env.MONGO_URI);
    this.database.connectToDatabase().then(() => {
        console.log(
            `${ChalkAdvanced.white('Would You?')} ${ChalkAdvanced.gray(
                '>',
            )} ${ChalkAdvanced.green('Successfully connected to the database')}`,
        );
    });

  }

  loginBot() {
    return this.login(process.env.TOKEN);
  }
};
