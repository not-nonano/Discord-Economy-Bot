const { EmbedBuilder, Client, Message, GuildMember, Collection, GuildChannel } = require("discord.js");
const ee = require("../../botconfig/embed.json");

require('dotenv').config()
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


var activeChecker = new Collection()
var shimdrop = shimdroptimer();

function shimdroptimer() {
    setInterval(async function () {
        //put the channel in collection
        sql.connect(sqlConfig).then(() => {
            return sql.query`SELECT * FROM Shimdrop`
        }).then(async result => {
            if (result.recordset.length == 0) return

            result.recordset.forEach(async function (value) {
                if (activeChecker.has(value.channelID)) return
                let min = parseInt(value.cooldownMin)
                let max = parseInt(value.cooldownMax)
                let cooldown = (Math.floor(Math.random() * (max - min + 1)) + min)
                cooldown = cooldown * 60000
                activeChecker.set(value.channelID, {
                    messageCount: 0,
                    lastTime: Date.now(),
                    cooldown: cooldown,
                    status: 'cooldown'
                })
            })
        }).catch(err => {
            console.log(err)
        })

        activeChecker.forEach(async function (value, key) {
            //check cooldown to ready to check active channel with collection
            if (value.status == 'cooldown') {
                let time = value.lastTime - (Date.now() - value.cooldown)
                if (time < 0) {
                    value.status = 'ready'
                }
            }
            //prepare
            if (value.status == 'preparing') {
                sql.connect(sqlConfig).then(() => {
                    return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${key}`
                }).then(async result => {
                    if (result.recordset.length == 0) return

                    let min = parseInt(result.recordset[0].cooldownMin)
                    let max = parseInt(result.recordset[0].cooldownMax)
                    value.cooldown = (Math.floor(Math.random() * (max - min + 1)) + min) * 60000
                    value.lastTime = Date.now()
                    value.status = 'cooldown'
                }).catch(err => {
                    console.log(err)
                })
            }
        })
    }, 3000);
}


module.exports = {
    name: "setShimdrop",
    category: "Economy",
    aliases: ["setshim", "setdrop", "shimdrop"],
    cooldown: 2,
    usage: "shimdrop <enable | disable | edit> <Channel> [cdMin% \"Minimum cd in minutes\" | default 20 minutes] [cdMax% \"Minimum cd in minutes\" | default 30 minutes] [reward% \"amount of shimmers\" | default 500 shims]",
    description: "",
    perms: true,
    activeChecker: activeChecker,
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
                if (!args[0]) {
                    sql.connect(sqlConfig).then(() => {
                        return sql.query`SELECT * FROM Shimdrop WHERE guildID = ${message.guild.id}`
                    }).then(async result => {
                        if (result.recordset.length == 0) {
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                    .setTitle(`Shimdrop Active Channels`)
                                    .setDescription(`None.`)]
                            }
                            )
                        } else {
                            showChannel(result.recordset, '', 1, 4, message, client)
                            /**
                             * let description = ""
                            result.recordset.forEach(async function (value) {
                                description +=
                                    `**Channel:** ${client.guilds.cache.get(value.guildID).channels.cache.get(value.channelID)}
                                **Reward:** ${value.reward} <a:uuYllwShk_Shimmer:727028870569525320>
                                **Minimum Cooldown:** ${value.cooldownMin} minutes
                                **Maximum Cooldown:** ${value.cooldownMax} minutes
                                **Status:** ${activeChecker.get(value.channelID).status} ${(activeChecker.get(value.channelID).status == 'cooldown') ? ' | ' + millisToMinutesAndSeconds((activeChecker.get(value.channelID).lastTime - (Date.now() - activeChecker.get(value.channelID).cooldown))) : ''}\n\n`
                                //
                            })

                            return message.channel.send(new EmbedBuilder()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, message.guild.iconURL())
                                .setTitle(`<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop | Active Channel`)
                                .setDescription(description)
                            )
                             */

                        }
                    }).catch(err => {
                        console.log(err)
                    })
                }
                else {
                    if (!['enable', 'disable', 'edit'].includes(args[0].toLowerCase()))
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.wrongcolor)
                                .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                .setTitle(`❌ ERROR | Empty Args`)
                                .setDescription(`shimdrop < enable | disable | edit > <Channel>`)]
                        }
                        )

                    let channel = message.guild.channels.cache.get(args[1]) || message.mentions.channels.first()
                    if (!channel)
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.wrongcolor)
                                .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                .setTitle(`❌ ERROR | Empty Args`)
                                .setDescription(`shimdrop <enable | disable> <Channel>`)]
                        }
                        )

                    let content = args.join(' ')
                    let cooldownMin = (content.includes('cdMin%')) ? content.split('cdMin%')[1].substring(text.split('cdMin%')[1].indexOf('"') + 1, text.split('cdMin%')[1].indexOf('"', 2)) : 20
                    if (isNaN(parseInt(cooldownMin))) return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.color)
                            .setTitle('❌ ERROR | An error occurred')
                            .setDescription('Minimum Cooldown(cdMin%) is not a number\nDon\'t forget the double quotes')
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                    }
                    )
                    cooldownMin = parseInt(cooldownMin)
                    let cooldownMax = (content.includes('cdMax%')) ? content.split('cdMax%')[1].substring(text.split('cdMax%')[1].indexOf('"') + 1, text.split('cdMax%')[1].indexOf('"', 2)) : 30
                    if (isNaN(parseInt(cooldownMax))) return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.color)
                            .setTitle('❌ ERROR | An error occurred')
                            .setDescription('Maximum Cooldown(cdMax%) is not a number\nDon\'t forget the double quotes')
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                    }
                    )
                    cooldownMax = parseInt(cooldownMax)
                    cooldownMin = cooldownMin
                    cooldownMax = cooldownMax

                    let reward = (content.includes('reward%')) ? content.split('reward%')[1].substring(text.split('reward%')[1].indexOf('"') + 1, text.split('reward%')[1].indexOf('"', 2)) : 500
                    if (isNaN(parseInt(reward))) return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.color)
                            .setTitle('❌ ERROR | An error occurred')
                            .setDescription('Reward is not a number\nDon\'t forget the double quotes')
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                    }
                    )
                    reward = parseInt(reward)

                    sql.connect(sqlConfig).then(() => {
                        return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${channel.id}`
                    }).then(async result => {
                        if (args[0] == 'enable' && result.recordset[0] !== undefined) {
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle('<a:Shimmers:729388357410619505> Shimdrop <a:Shimmers:729388357410619505>')
                                    .setDescription(`${channel} is already **enabled**.`)
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                            }
                            )
                        }
                        if (args[0] == 'enable' && result.recordset[0] === undefined) {
                            sql.query`INSERT INTO Shimdrop(channelID, guildID, reward, cooldownMin, cooldownMax) 
                        VALUES(${channel.id}, ${message.guild.id}, ${reward}, ${cooldownMin}, ${cooldownMax})`
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle('<a:Shimmers:729388357410619505> Shimdrop <a:Shimmers:729388357410619505>')
                                    .setDescription(`${channel} is now **enabled** shimdrop!.`)
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                            }
                            )
                        }
                        if (args[0] == 'disable' && result.recordset[0] !== undefined) {
                            sql.query`DELETE FROM Shimdrop WHERE channelID = ${channel.id}`
                            if (activeChecker.has(channel.id))
                                activeChecker.delete(channel.id)
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle('<a:Shimmers:729388357410619505> Shimdrop <a:Shimmers:729388357410619505>')
                                    .setDescription(`${channel} is now **deleted** shimdrop!.`)
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                            }
                            )
                        }
                        if (args[0] == 'disable' && result.recordset[0] === undefined) {
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle('<a:Shimmers:729388357410619505> Shimdrop <a:Shimmers:729388357410619505>')
                                    .setDescription(`${channel} is already **disabled**.`)
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                            }
                            )
                        }

                        if (args[0] == 'edit' && result.recordset[0] !== undefined) {
                            let updatedCdMin = (content.includes('cdMin%')) ? parseInt(content.split('cdMin%')[1].substring(text.split('cdMin%')[1].indexOf('"') + 1, text.split('cdMin%')[1].indexOf('"', 2))) : result.recordset[0].cooldownMin
                            let updatedCdMax = (content.includes('cdMax%')) ? parseInt(content.split('cdMax%')[1].substring(text.split('cdMax%')[1].indexOf('"') + 1, text.split('cdMax%')[1].indexOf('"', 2))) : result.recordset[0].cooldownMax
                            let updatedReward = (content.includes('reward%')) ? parseInt(content.split('reward%')[1].substring(text.split('reward%')[1].indexOf('"') + 1, text.split('reward%')[1].indexOf('"', 2))) : result.recordset[0].reward
                            sql.query`UPDATE Shimdrop SET cooldownMin = ${updatedCdMin}, cooldownMax = ${updatedCdMax}, reward = ${updatedReward} WHERE channelID = ${channel.id}`
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle('<a:Shimmers:729388357410619505> Shimdrop <a:Shimmers:729388357410619505>')
                                    .setDescription(`${channel} successfully edited the configuration!.`)
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                            }
                            )
                        }
                        if (args[0] == 'edit' && result.recordset[0] === undefined) {
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle('<a:Shimmers:729388357410619505> Shimdrop <a:Shimmers:729388357410619505>')
                                    .setDescription(`${channel} is currently **disabled**.`)
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                            }
                            )
                        }

                    }).catch(err => {
                        console.log(err)
                    })
                }
            } catch (e) {
                console.log(String(e.stack).bgRed)
                return message.channel.send(new EmbedBuilder()
                    .setColor(ee.wrongcolor)
                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                    .setTitle(`❌ ERROR | An error occurred`)
                    .setDescription(`\`\`\`${e.stack}\`\`\``)
                );
            }
        }
}

/**
 * 
 * @param {Array} arr 
 * @param {String} description 
 * @param {Number} page 
 * @param {Number} max 
 * @param {Message} message 
 * @param {Client} client
 */
async function showChannel(arr, description, page, max, message, client) {
    arr.forEach(async function (value, index) {
        if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
            description += `**Channel:** ${client.guilds.cache.get(value.guildID).channels.cache.get(value.channelID)}
            **Reward:** ${value.reward} <a:uuYllwShk_Shimmer:727028870569525320>
            **Minimum Cooldown:** ${value.cooldownMin} minutes
            **Maximum Cooldown:** ${value.cooldownMax} minutes
            **Status:** ${activeChecker.get(value.channelID).status} ${(activeChecker.get(value.channelID).status == 'cooldown') ? ' | ' + millisToMinutesAndSeconds((activeChecker.get(value.channelID).lastTime - (Date.now() - activeChecker.get(value.channelID).cooldown))) : ''}\n\n`
        }
    })

    message.channel.send({
        embeds: [new EmbedBuilder()
            .setColor(ee.color)
            .setTitle('<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop | Active Channel')
            .setDescription(description)
            .setFooter({ text: ee.footertext, iconURL: ee.footericon })
        ]
    })
        .then(async msg => {
            await msg.reactions.removeAll()
            if ((0 < (max * page) - max))
                await msg.react('⬅')
            if ((arr.length > max * page))
                await msg.react('➡')

            const filter = (reaction, user) => {
                return ['⬅', '➡'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            msg.awaitReactions({ filter, max: 1, time: 10000, errors: ['time'] })
                .then(async collected => {
                    description = ''
                    if (collected.first().emoji.name == '⬅') {
                        page -= 1
                        arr.forEach(async function (value, index) {
                            if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                                description += `**Channel:** ${client.guilds.cache.get(value.guildID).channels.cache.get(value.channelID)}
                        **Reward:** ${value.reward} <a:uuYllwShk_Shimmer:727028870569525320>
                        **Minimum Cooldown:** ${value.cooldownMin} minutes
                        **Maximum Cooldown:** ${value.cooldownMax} minutes
                        **Status:** ${activeChecker.get(value.channelID).status} ${(activeChecker.get(value.channelID).status == 'cooldown') ? ' | ' + millisToMinutesAndSeconds((activeChecker.get(value.channelID).lastTime - (Date.now() - activeChecker.get(value.channelID).cooldown))) : ''}\n\n`
                            }
                        })

                        msg.edit({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.color)
                                .setTitle('<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop | Active Channel')
                                .setDescription(description)
                                .setFooter({ text: ee.footertext, iconURL: ee.footericon })
                            ]
                        }).then(async msg => {
                            loopUpdate(arr, description, page, max, msg, client, message.author.id)
                        })
                    }
                    if (collected.first().emoji.name == '➡') {
                        page += 1
                        arr.forEach(async function (value, index) {
                            if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                                description += `**Channel:** ${client.guilds.cache.get(value.guildID).channels.cache.get(value.channelID)}
                        **Reward:** ${value.reward} <a:uuYllwShk_Shimmer:727028870569525320>
                        **Minimum Cooldown:** ${value.cooldownMin} minutes
                        **Maximum Cooldown:** ${value.cooldownMax} minutes
                        **Status:** ${activeChecker.get(value.channelID).status} ${(activeChecker.get(value.channelID).status == 'cooldown') ? ' | ' + millisToMinutesAndSeconds((activeChecker.get(value.channelID).lastTime - (Date.now() - activeChecker.get(value.channelID).cooldown))) : ''}\n\n`
                            }
                        })

                        msg.edit({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.color)
                                .setTitle('<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop | Active Channel')
                                .setDescription(description)
                                .setFooter({ text: ee.footertext, iconURL: ee.footericon })
                            ]
                        }).then(async msg => {
                            loopUpdate(arr, description, page, max, msg, client, message.author.id)
                        })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
}

/**
 * 
 * @param {Array} arr 
 * @param {String} description 
 * @param {Number} page 
 * @param {Number} max 
 * @param {Message} msg 
 * @param {Client} client
 * @param {String} authorID
 */
async function loopUpdate(arr, description, page, max, msg, client, authorID) {
    await msg.reactions.removeAll()
    if ((0 < (max * page) - max))
        await msg.react('⬅')
    if ((arr.length > max * page))
        await msg.react('➡')
    description = ''

    const filter = (reaction, user) => {
        return ['⬅', '➡'].includes(reaction.emoji.name) && user.id === authorID;
    };

    msg.awaitReactions({ filter, max: 1, time: 10000, errors: ['time'] })
        .then(async collected => {
            if (collected.first().emoji.name == '⬅') {
                page -= 1
                arr.forEach(async function (value, index) {
                    if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                        description += `**Channel:** ${client.guilds.cache.get(value.guildID).channels.cache.get(value.channelID)}
                        **Reward:** ${value.reward} <a:uuYllwShk_Shimmer:727028870569525320>
                        **Minimum Cooldown:** ${value.cooldownMin} minutes
                        **Maximum Cooldown:** ${value.cooldownMax} minutes
                        **Status:** ${activeChecker.get(value.channelID).status} ${(activeChecker.get(value.channelID).status == 'cooldown') ? ' | ' + millisToMinutesAndSeconds((activeChecker.get(value.channelID).lastTime - (Date.now() - activeChecker.get(value.channelID).cooldown))) : ''}\n\n`
                    }
                })

                msg.edit({
                    embeds: [new EmbedBuilder()
                        .setColor(ee.color)
                        .setTitle('<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop | Active Channel')
                        .setDescription(description)
                        .setFooter({ text: ee.footertext, iconURL: ee.footericon })
                    ]
                }).then(async msg => {
                    loopUpdate(arr, description, page, max, msg, client, authorID)
                })
            }
            if (collected.first().emoji.name == '➡') {
                page += 1
                arr.forEach(async function (value, index) {
                    if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                        description += `**Channel:** ${client.guilds.cache.get(value.guildID).channels.cache.get(value.channelID)}
                        **Reward:** ${value.reward} <a:uuYllwShk_Shimmer:727028870569525320>
                        **Minimum Cooldown:** ${value.cooldownMin} minutes
                        **Maximum Cooldown:** ${value.cooldownMax} minutes
                        **Status:** ${activeChecker.get(value.channelID).status} ${(activeChecker.get(value.channelID).status == 'cooldown') ? ' | ' + millisToMinutesAndSeconds((activeChecker.get(value.channelID).lastTime - (Date.now() - activeChecker.get(value.channelID).cooldown))) : ''}\n\n`
                    }
                })

                msg.edit({
                    embeds: [new EmbedBuilder()
                        .setColor(ee.color)
                        .setTitle('<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop | Active Channel')
                        .setDescription(description)
                        .setFooter({ text: ee.footertext, iconURL: ee.footericon })
                    ]
                }).then(async msg => {
                    loopUpdate(arr, description, page, max, msg, client, authorID)
                })
            }

        })
        .catch(err => {
            console.log(err)
        })
}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
