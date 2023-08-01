const { connect } = require("mongoose").set('strictQuery', true);
const { ChalkAdvanced } = require("chalk-advanced");

module.exports = class DatabaseHandler {
    /**
     * Create a database handler
     * @param {string} connectionString the connection string
     */
    constructor(connectionString) {
        this.connectionString = connectionString;
    }

    /**
     * Connect to the mongoose database
     * @returns {Promise<void>}
     */
    async connectToDatabase() {
       await connect(this.connectionString, {
            useNewUrlParser: true,
        }).catch((err) => {
            console.log(err);
        }).then(() => console.log(
            `${ChalkAdvanced.white('Database')} ${ChalkAdvanced.gray(
                '>',
            )} ${ChalkAdvanced.green('Successfully loaded database')}`,
        ));
    }

};
