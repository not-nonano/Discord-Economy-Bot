const { EmbedBuilder, Client, Message, GuildMember, MessageCollector, Collection } = require("discord.js")
const { wrongcolor, footertext, color } = require("../../botconfig/embed.json");
const ee = require("../../botconfig/embed.json");
let ChannelCollection = new Collection()
var reward

module.exports = {
    name: "quizdrop",
    category: "Extra",
    aliases: ["q?", "question"],
    cooldown: 2,
    usage: "question <mention channels> ++ <question> ++ <answer> ++ <amount of shimmers> ++ [roles]",
    description: "Shim Drop Question to mentioned channels",
    perms: true,
    channelcollection: ChannelCollection,
    reward: reward,
    run:
        /** 
        * @param {Client} client
        * @param {Message} message
        * @param {Array} args
        * @param {GuildMember} user
        * @param {String} text
         */
        async (client, message, args, user, text, prefix) => {
            return message.channel.send('tinatamad si nona ayusin kase walang nag momotivate sakanya')
            try {
                if (ChannelCollection.size !== 0) return message.channel.send(`quizdrop is currently running ♥`)
                let content = args.join(' ')
                if (!content)
                    return message.channel.send(new EmbedBuilder()
                        .setColor(wrongcolor)
                        .setFooter(footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | An error occurred`)
                        .setDescription(`Missing args\nUsage: question <mention channels> ++ <question> ++ <answer> ++ <amount of shimmers> ++ [roles]`)
                    );
                let collected = content.split('++')
                if (!collected[0] || !collected[1] || !collected[2] || !collected[3])
                    return message.channel.send(new EmbedBuilder()
                        .setColor(wrongcolor)
                        .setFooter(footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | An error occurred`)
                        .setDescription(`Missing args\nUsage: question <mention channels> ++ <question> ++ <answer> ++ <amount of shimmers> ++ [roles]`)
                    );
                let channel = collected[0].split(" ")
                let question = collected[1]
                let answer = collected[2].trim()
                reward = parseInt(collected[3])
                if (isNaN(reward)) return message.channel.send({ embed: { color: ee.color, description: 'I need whole number.' } })
                let rawRoles = (collected[4]) ? collected[4].split(' ') : null

                message.channel.send('Ready to send this question?', {
                    embed: {
                        description: question,
                        color: color,
                        image: { url: (message.attachments.first()) ? message.attachments.first().url : null },
                        footer: {
                            text: footertext
                        }
                    }
                }).then(async msg => {
                    await msg.react('✅')
                    await msg.react('❌')

                    const filter = (reaction, user) => {
                        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                    };
                    msg.awaitReactions(filter, { max: 1, time: 10000, errors: ["time"] })
                        .then(async response => {
                            if (response.first().emoji.name === '✅') {


                                channel.forEach(function (res, index) {
                                    let serverChannel = client.channels.cache.get(res.replace(/\D/g, ''))
                                    if (serverChannel) {
                                        ChannelCollection.set(res.replace(/\D/g, ''), { answer: answer, reward: reward })
                                        message.guild.channels.cache.get(res.replace(/\D/g, '')).send({
                                            embed: {
                                                description: question,
                                                color: color,
                                                image: { url: (message.attachments.first()) ? message.attachments.first().url : null },
                                                footer: {
                                                    text: footertext
                                                }
                                            }
                                        })
                                    }
                                })

                                if (rawRoles) {
                                    rawRoles.forEach(function (res, index) {
                                        roles.push(res.replace(/\D/g, ''))
                                    })
                                }

                                message.channel.send("Set ♥")
                            } else
                                return message.channel.send("canceled ♥ hihihihi")
                        })
                        .catch(err => {
                            return message.channel.send("canceled ♥ hihihihi")
                        })
                })

            } catch (e) {
                console.log(String(e.stack).bgRed);
                return message.channel.send(new EmbedBuilder()
                    .setColor(wrongcolor)
                    .setFooter(footertext, message.guild.iconURL())
                    .setTitle(`❌ ERROR | An error occurred`)
                    .setDescription(`\`\`\`${e.stack}\`\`\``)
                );
            }
        }
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
