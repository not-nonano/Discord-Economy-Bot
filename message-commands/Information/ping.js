const { EmbedBuilder, Client, Message } = require("discord.js");
const ee = require("../../botconfig/embed.json");
module.exports = {
  name: "ping",
  category: "Information",
  aliases: ["latency"],
  cooldown: 2,
  usage: "ping",
  description: "Gives you information on how fast the Bot can respond to you",
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
            .setTitle(`🏓 Pinging....`)]
        }
        ).then(msg => {
          msg.edit({
            embeds: [new EmbedBuilder()
              .setColor(ee.color)
              .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
              .setTitle(`🏓 Ping is \`${Math.round(client.ws.ping)}ms\``)]
          }
          );
        })
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
