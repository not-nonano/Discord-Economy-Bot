const { EmbedBuilder, Client, Message } = require("discord.js");
const ee = require("../../botconfig/embed.json");
const { duration } = require("../../handlers/functions")
module.exports = {
  name: "uptime",
  category: "Information",
  aliases: [""],
  cooldown: 10,
  usage: "uptime",
  description: "Returns the duration on how long the Bot is online",
  run:
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} user 
     * @param {*} text 
     * @param {*} prefix 
     * @returns 
     */
    async (client, message, args, user, text, prefix) => {
      try {
        message.channel.send({
          embeds: [new EmbedBuilder()
            .setColor(ee.color)
            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
            .setTitle(`:white_check_mark: **${client.user.username}** is since:\n ${duration(client.uptime)} online`)]
        }
        );
      } catch (e) {
        console.log(String(e.stack).bgRed)
        return message.channel.send({
          embeds: [new EmbedBuilder()
            .setColor(ee.wrongcolor)
            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
            .setTitle(`❌ ERROR | An error occurred`)
            .setDescription(`\`\`\`${e.stack}\`\`\``)]
        }
        );
      }
    }
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
