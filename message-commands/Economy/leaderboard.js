const { EmbedBuilder, Client, Message, GuildMember } = require("discord.js");
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



module.exports = {
    name: "leaderboard",
    category: "Economy",
    aliases: ["lb", "top"],
    cooldown: 2,
    usage: "leaderboard [page]",
    description: "",
    perms: false,
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
                sql.connect(sqlConfig).then(() => {
                    return sql.query`SELECT * FROM Economy`
                }).then(async result => {
                    result.recordset.sort(function (a, b) { return b.shims - a.shims })
                    showLeaderboard(result.recordset, '', (parseInt(args[0])) ? args[0] : 1, 10, message, client)
                }).catch(err => {
                    console.log(err)
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


/**
 * 
 * @param {Array} arr 
 * @param {String} description 
 * @param {Number} page 
 * @param {Number} max 
 * @param {Message} message 
 * @param {Client} client
 */
async function showLeaderboard(arr, description, page, max, message, client) {
    arr.forEach(function (value, index) {
        if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
            description += `**${index + 1}.** \`${(client.users.cache.get(value.userID)) ? client.users.cache.get(value.userID).tag : 'Deleted User'}\` ${addCommas(value.shims)} <a:uuYllwShk_Shimmer:727028870569525320>\n`
        }
    })

    message.channel.send({
        embeds: [{
            color: ee.color,
            footer: {
                text: `No. ${arr.map(function (a) { return a.userID }).indexOf(message.author.id) + 1} ${client.users.cache.get(message.author.id).tag}`,
                icon_url: ee.footericon
            },
            title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmers | Leaderboards <a:uuYllwShk_Shimmer:727028870569525320>`,
            description: description
        }]
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

            msg.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                .then(async collected => {
                    description = ''
                    if (collected.first().emoji.name == '⬅') {
                        page -= 1
                        arr.forEach(async function (value, index) {
                            if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                                description += `**${index + 1}.** \`${(client.users.cache.get(value.userID)) ? client.users.cache.get(value.userID).tag : 'Deleted User'}\` ${addCommas(value.shims)} <a:uuYllwShk_Shimmer:727028870569525320>\n`
                            }
                        })

                        msg.edit({
                            embeds: [{
                                color: ee.color,
                                footer: {
                                    text: `No. ${arr.map(function (a) { return a.userID }).indexOf(message.author.id) + 1} ${client.users.cache.get(message.author.id).tag}`,
                                    icon_url: ee.footericon
                                },
                                title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmers | Leaderboards <a:uuYllwShk_Shimmer:727028870569525320>`,
                                description: description
                            }]
                        }).then(async msg => {
                            loopUpdate(arr, description, page, max, msg, client, message.author.id)
                        })
                    }
                    if (collected.first().emoji.name == '➡') {
                        page += 1
                        arr.forEach(async function (value, index) {
                            if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                                description += `**${index + 1}.** \`${(client.users.cache.get(value.userID)) ? client.users.cache.get(value.userID).tag : 'Deleted User'}\` ${addCommas(value.shims)} <a:uuYllwShk_Shimmer:727028870569525320>\n`
                            }
                        })

                        msg.edit({
                            embeds: [{
                                color: ee.color,
                                footer: {
                                    text: `No. ${arr.map(function (a) { return a.userID }).indexOf(message.author.id) + 1} ${client.users.cache.get(message.author.id).tag}`,
                                    icon_url: ee.footericon
                                },
                                title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmers | Leaderboards <a:uuYllwShk_Shimmer:727028870569525320>`,
                                description: description
                            }]
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

    msg.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
        .then(async collected => {
            if (collected.first().emoji.name == '⬅') {
                page -= 1
                arr.forEach(async function (value, index) {
                    if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                        description += `**${index + 1}.** \`${(client.users.cache.get(value.userID)) ? client.users.cache.get(value.userID).tag : 'Deleted User'}\` ${addCommas(value.shims)} <a:uuYllwShk_Shimmer:727028870569525320>\n`
                    }
                })

                msg.edit({
                    embeds: [{
                        color: ee.color,
                        footer: {
                            text: `No. ${arr.map(function (a) { return a.userID }).indexOf(authorID) + 1} ${client.users.cache.get(authorID).tag}`,
                            icon_url: ee.footericon
                        },
                        title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmers | Leaderboards <a:uuYllwShk_Shimmer:727028870569525320>`,
                        description: description
                    }]
                }).then(async msg => {
                    loopUpdate(arr, description, page, max, msg, client, authorID)
                })
            }
            if (collected.first().emoji.name == '➡') {
                page += 1
                arr.forEach(async function (value, index) {
                    if ((index >= ((max * page) - max)) && (index <= (max * page - 1))) {
                        description += `**${index + 1}.** \`${(client.users.cache.get(value.userID)) ? client.users.cache.get(value.userID).tag : 'Deleted User'}\` ${addCommas(value.shims)} <a:uuYllwShk_Shimmer:727028870569525320>\n`
                    }
                })

                msg.edit({
                    embeds: [{
                        color: ee.color,
                        footer: {
                            text: `No. ${arr.map(function (a) { return a.userID }).indexOf(authorID) + 1} ${client.users.cache.get(authorID).tag}`,
                            icon_url: ee.footericon
                        },
                        title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmers | Leaderboards <a:uuYllwShk_Shimmer:727028870569525320>`,
                        description: description
                    }]
                }).then(async msg => {
                    loopUpdate(arr, description, page, max, msg, client, authorID)
                })
            }

        })
        .catch(err => {
            console.log(err)
        })
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */

