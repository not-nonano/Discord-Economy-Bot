const { EmbedBuilder, Client, Message, GuildMember } = require("discord.js");
const ee = require("../../botconfig/embed.json");

module.exports = {
  name: "send",
  category: "Administration",
  aliases: ["say"],
  cooldown: 2,
  usage: "embed <mention channels> ++ <DESCRIPTION>",
  description: "Send text with the bot.",
  perms: true,
  run:
    /**
    *
    * @param {Client} client
    * @param {Message} message
    * @param {Array} args
    * @param {GuildMember} user
    * @param {String} text
     */
    async (client, message, args, user, text, prefix) => {
      try {
        let content = args.join(' ')
        let collected = content.split('++')

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
