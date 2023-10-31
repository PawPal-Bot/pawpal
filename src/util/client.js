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
const ButtonHandler = require("./buttonHandler");
const EventHandler = require("./eventLoader");
const ModalHandler = require("./modalHandler");

module.exports = class AdoptMe extends Client {
  constructor(customCacheOptions = {}) {
    super({
      intents: [GatewayIntentBits.Guilds],
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

    // Button Loader
    this.buttonHandler = new ButtonHandler(this);
    this.buttonHandler.load();

    // Modal Loader
    this.modalsHandler = new ModalHandler(this);
    this.modalsHandler.load();

    // Start the database
    this.database = new DatabaseHandler(process.env.MONGO_URI);

    this.database
      .connectToDatabase()
      .then(() => {
        console.log(
          `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
            ">"
          )} ${ChalkAdvanced.green("Successfully connected to the database")}`
        );
        this.database.startSweeper();
      })
      .catch((error) => {
        console.error(
          `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
            ">"
          )} ${ChalkAdvanced.red("Failed to connect to the database:")} ${
            error.message
          }`
        );
        process.exit(1);
      });
  }

  async loginBot() {
    try {
      await this.login(process.env.TOKEN);
    } catch (error) {
      console.error(`${ChalkAdvanced.red("Error logging in:")}`, error);
    }
  }
};
