const { Client, Partials, Collection, GatewayIntentBits } = require("discord.js");
const { log } = require("../functions/index");
const config = require('../config');
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
            modals: new Collection()
        }
    };
    applicationcommandsArray = [];


    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessageReactions,
            ],
            partials: [Object.keys(Partials)],
        });
    };

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
            log(`Activity updated: ${totalPets} furry friends`, 'done');
        } catch (error) {
            log(`Error updating bot activity: ${error}`, 'err');
        }
    };
};