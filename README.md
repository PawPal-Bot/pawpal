# PawPal - Virtual Pet

Raise a lovable red panda, a playful dog, or an adorable cat in this interactive Discord pet bot!

![PawPal Banner](https://imgur.com/W0AYhUf.png)

## Requirements

1. **Node.js:** Make sure you have Node.js installed on your system.

   - Download and install Node.js from [nodejs.org](https://nodejs.org/).

2. **MongoDB:** You will need a MongoDB database to store pet data.
   - Sign up for a MongoDB account at [mongodb.com](https://www.mongodb.com/).
   - Create a new MongoDB cluster and note down the connection string.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/virtual-pet-bot.git
   cd virtual-pet-bot
   ```

2. Install the necessary dependencies

   ```bash
   npm install
   ```

3. Create and fill out the .env file

   ```bash
   CLIENT_TOKEN =
   CLIENT_ID =
   MONGODB_URI =
   GUILD_ID =
   DEVELOPMENT = true/false
   ## WEBHOOKS
   ## Join/Leave Event
   GUILDACTIVITY_WEBHOOK_ID=
   GUILDACTIVITY_WEBHOOK_TOKEN=
   ```

````

## Deployment

Start the project using

```bash
npm run start
````

The bot should now be running on your server and ready to interact with your Discord community.
