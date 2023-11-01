const { connect } = require("mongoose").set("strictQuery", true);
const { ChalkAdvanced } = require("chalk-advanced");

module.exports = class DatabaseHandler {
  /**
   * Create a database handler
   * @param {string} connectionString the connection string
   */
  constructor(connectionString) {
    this.cache = new Map();
    this.userModel = require("./Models/userModel");
    this.connectionString = connectionString;
  }

  /**
   * This is the cache sweeper to keep the cache clean!
   * @param client the client object
   */
  startSweeper(client) {
    setInterval(
      () => {
        const users = this.cache.values();
        for (const user of users) {
          if (!client?.users?.cache?.has(user?.userId)) {
            this.cache.delete(user?.userId);
          }
        }
        if (process.env.STATUS === "DEVELOPMENT") {
          console.log(
            `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
              ">"
            )} ${ChalkAdvanced.green("Cache sweep completed")}`
          );
        }
      },
      60 * 60 * 1000
    );
  }

  /**
   * Connect to the mongoose database
   * @returns {Promise<void>}
   */
  async connectToDatabase() {
    await connect(this.connectionString, { useNewUrlParser: true })
      .catch((err) => {
        console.error(`${ChalkAdvanced.red("Database Error >")} ${err}`);
      })
      .then(() =>
        console.log(
          `${ChalkAdvanced.white("AdoptMe Bot")} ${ChalkAdvanced.gray(
            ">"
          )} ${ChalkAdvanced.green("Database: Successfully loaded database")}`
        )
      );
  }

  /**
   * Fetch a user from the database (Not suggested use .get()!)
   * @param {number|string} userId the server id
   * @param {boolean} createIfNotFound create a database entry if not found
   * @returns {this.userModel}
   * @private
   */
  async fetchUser(userId, createIfNotFound = false) {
    return await this.userModel
      .findOne({ userId: userId })
      .catch((err) => {
        console.error(`${ChalkAdvanced.red("Fetch User Error >")} ${err}`);
      })
      .then((fetched) => {
        if (fetched) return fetched;
        if (!fetched && createIfNotFound) {
          return this.userModel
            .create({
              userId: userId,
              language: "en_EN",
              botJoined: (Date.now() / 1000) | 0,
            })
            .then(() => this.userModel.findOne({ userId: userId }))
            .catch((err) => {
              console.error(
                `${ChalkAdvanced.red("Create/Fetch User Error >")} ${err}`
              );
            });
        }
        return null;
      });
  }

  /**
   * Get a user database from the cache
   * @param {string} userId the server id
   * @param {boolean} createIfNotFound create a database entry if not found
   * @param {boolean} force if it should force fetch the user
   * @returns {this.userModel}
   */
  async getUser(userId, createIfNotFound = true, force = false) {
    if (force) return this.fetchUser(userId, createIfNotFound);

    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    const fetched = await this.fetchUser(userId, createIfNotFound);
    if (fetched) {
      this.cache.set(userId, fetched?.toObject() ?? fetched);

      return this.cache.get(userId);
    }
    return null;
  }

  /**
   * Delete a user from the db and the cache
   * @param {number|string} userId the server id
   * @param {boolean} onlyCache if you want to only delete the cache
   * @returns {Promise<deleteMany|boolean>}
   */
  async deleteUser(userId, onlyCache = false) {
    if (this.cache.has(userId)) this.cache.delete(userId);

    return !onlyCache ? this.userModel.deleteMany({ userId: userId }) : true;
  }

  /**
   * Update the settings from a user
   * @param {number|string} userId the server id
   * @param {object | this.userModel} data the updated or new data
   * @param {boolean} createIfNotFound create a database entry if not found
   * @returns {Promise<this.userModel|null>}
   */
  async updateUser(userId, data = {}, createIfNotFound = false) {
    let oldData = await this.getUser(userId, createIfNotFound).catch((err) => {
      console.error(`${ChalkAdvanced.red("Get User Error >")} ${err}`);
    });

    if (oldData) {
      if (oldData?._doc) oldData = oldData?._doc;

      data = { ...oldData, ...data };

      this.cache.set(userId, data);

      return this.userModel.updateOne({ userId: userId }, data).catch((err) => {
        console.error(`${ChalkAdvanced.red("Update User Error >")} ${err}`);
      });
    }
    return null;
  }

  /**
   * Fetch all available settings
   * @returns {Promise<this.userModel[]>}
   */
  async getAll() {
    return await this.userModel.find().catch((err) => {
      console.error(`${ChalkAdvanced.red("Get All Users Error >")} ${err}`);
    });
  }
};
