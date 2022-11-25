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
        let channel = collected[0].split(" ")
        if (!channel) return message.channel.send('no channel mentioned')
        if (!message.attachments.first() && !collected[1]) return message.channel.send("Module format: `sm.send [channels]++[message/picture]`")

        let menCh = message.mentions.channels.first()
        if (!menCh) return message.channel.send('no channel mentioned')
        let msg = args.slice(1).join(' ')

        //if theres picture but no message 
        if (message.attachments.first() && !collected[1]) {
          pic = new Discord.MessageAttachment(message.attachments.first())
          channel.forEach(function (res, index) {
            if (res == '') return
            message.guild.channels.cache.get(res.replace(/\D/g, '')).send(pic)
          })
        }

        //if theres a picture and messages too
        else if (message.attachments.first() && collected[1]) {
          channel.forEach(function (res, index) {
            if (res == '') return
            message.guild.channels.cache.get(res.replace(/\D/g, '')).send(msg)
            pic = new Discord.MessageAttachment(message.attachments.first())
            message.guild.channels.cache.get(res.replace(/\D/g, '')).send(pic)
          })
        }

        //if messages only
        else
          channel.forEach(function (res, index) {
            if (res == '') return
            message.guild.channels.cache.get(res.replace(/\D/g, '')).send(collected[1])
          })

      } catch (e) {
        console.log(String(e.stack).bgRed)
        return message.channel.send({
          embeds: [new EmbedBuilder()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, message.guild.iconURL())
            .setTitle(`❌ ERROR | An error occurred`)
            .setDescription(`\`\`\`${e.stack}\`\`\``)]
        }
        );
      }
    }
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
