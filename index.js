require('dotenv').config()

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ],
    partials: [
      Partials.Channel,
      Partials.GuildMember,
      Partials.Message,
      Partials.Reaction,
      Partials.User
    ],
    messageCacheLifetime: 60,
    fetchAllMembers: true,
    messageCacheMaxSize: 10,
    restTimeOffset: 0,
    restWsBridgetimeout: 100,
    disableEveryone: true,
  });

client.commands = new Collection();
client.messageCommands = new Collection();

["command", "event", "message-commands"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});


client.login(process.env.TEST_TOKEN);