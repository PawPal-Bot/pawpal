module.exports = {
  handler: {
    prefix: "?",
    deploy: true,
    commands: {
      prefix: false,
      slash: true,
      user: true,
      message: true,
    },
    mongodb: {
      toggle: true,
    },
  },
  users: {
    developers: ["201274851980214273", "347077478726238228"],
  },
  messageSettings: {
    nsfwMessage: "The current channel is not a NSFW channel.",
    developerMessage: "You are not authorized to use this command.",
    cooldownMessage: "Slow down buddy! You're too fast to use this command.",
    notHasPermissionMessage: "You do not have the permission to use this command.",
    missingDevIDsMessage: "This is a developer only command, but unable to execute due to missing user IDs in configuration file.",
  },
};
