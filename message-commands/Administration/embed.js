const { MessageEmbed, Client, Message, GuildMember } = require("discord.js");
const ee = require("../../botconfig/embed.json");
module.exports = {
  name: "embed",
  category: "Administration",
  aliases: ["say-embed"],
  cooldown: 2,
  usage: "embed <mention channels> ++ [title] ++ [description]]",
  description: "sends a message from you as an Embed",
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
        let channel = collected[0].split(" ")
        let title = collected[1]
        let desc = collected[2]
        let userargs = title + desc

        if (!userargs)
          return message.channel.send(new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`❌ ERROR | You didn't provided a Title, nor a Description`)
            .setDescription("embed <mention channels> / <TITLE> ++ <DESCRIPTION>")
          )

        channel.forEach(function (res, index) {
          if (res == '') return
          message.guild.channels.cache.get(res.replace(/\D/g, '')).send(new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, message.guild.iconURL())
            .setTitle(title ? title : "")
            .setDescription(desc ? desc : "")
            .setImage(message.attachments.first() ? message.attachments.first().url : null)
          )
        })

      } catch (e) {
        console.log(String(e.stack).bgRed)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, message.guild.iconURL())
          .setTitle(`❌ ERROR | An error occurred`)
          .setDescription(`\`\`\`${e.stack}\`\`\``)
        );
      }
    }
}
/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
