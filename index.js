require('dotenv').config()

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent
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
client.cooldowns = new Collection();
client.aliases = new Collection();

["command", "event", "message-commands"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

const sql = require('mssql')
const sqlConfig = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    server: process.env.DATABASE_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}


client.login(process.env.DISCORD_TOKEN);

var reset = resettimer();

// if 7 then reset
function resettimer() {
  var h, m, s, day, month;
  setInterval(function () {
    var estTime = new Date();
    var currentDateTimeCentralTimeZone = new Date(estTime.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    s = currentDateTimeCentralTimeZone.getSeconds();
    m = currentDateTimeCentralTimeZone.getMinutes();
    h = currentDateTimeCentralTimeZone.getHours();
  }, 1000);



  setInterval(async function () {
    //console.log(h + "" + m + "" + s);
    if (h == 7 && m == 0 && s == 0) {
      await sql.connect(sqlConfig)
      await sql.query(`UPDATE Economy SET daily = ${parseInt(0)} WHERE daily = ${parseInt(1)}`)
    }
  }, 1000);
}
