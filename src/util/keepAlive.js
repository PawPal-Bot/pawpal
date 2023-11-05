require("dotenv").config();

class KeepAlive {
    constructor(client) {
        this.client = client;
    }

    /**
     * Start the keep alive system (listener to the process)
     */
    start() {
        this.client.rest.on("rateLimited", (log) => {
            const { route: path, limit, timeToReset: timeout } = log;
            console.log( `Rate limited on ${path} with a limit of ${limit} and a timeout of ${timeout}` );
        });

        this.client.on("error", (err) => {
            console.log(err);
        });

        this.client.on("warn", async (info) => {
            console.log(info);
        });

        process.on("unhandledRejection", async (reason) => {
            console.log(reason);
        });

        process.on("uncaughtException", async (err) => {
            console.log(err);
        });
        process.on("uncaughtExceptionMonitor", async (err) => {
            console.log(err);
        });
        process.on("UnhandledPromiseRejection", (err) => {
            console.log(err);
        });
    }
}

module.exports = KeepAlive;