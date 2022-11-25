const { EmbedBuilder, Client, Message, GuildMember } = require("discord.js");
const ee = require("../../botconfig/embed.json");
let result

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
    name: "daily",
    category: "Economy",
    aliases: ["d"],
    cooldown: 2,
    usage: "Collect your daily shims.",
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
                sql.connect(sqlConfig)
                    .then(() => {
                        return sql.query`SELECT * FROM Economy WHERE userID = ${user.id}`
                    })
                    .then(async result => {
                        if (result.recordset[0]) {
                            if (!result.recordset[0].daily == 1) {
                                await sql.query(`UPDATE Economy SET shims = ${result.recordset[0].shims + parseInt(500)}, daily = ${parseInt(1)} WHERE userID = '${user.id}'`)
                                return message.channel.send({
                                    embeds: [new EmbedBuilder()
                                        .setColor(ee.color)
                                        .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                        .setTitle('• Daily')
                                        .setDescription(`\nHere's your daily Shimmers! \n\nYou got 500 <a:Shimmers:729388357410619505>!\n──────── ⋅⋆ ─ ⋆⋅ ────────`)]
                                }
                                )
                            }
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                    .setTitle('• Daily')
                                    .setDescription(`\nYou've already collected your daily Shimmers <a:Shimmers:729388357410619505>!\n──────── ⋅⋆ ─ ⋆⋅ ────────`)]
                            }
                            )
                        }

                        else {
                            await sql.query`INSERT INTO Economy(userID, shims, daily) VALUES(${user.id}, ${parseInt(500)}, ${parseInt(1)})`
                            return message.channel.send({
                                embeds: [new EmbedBuilder()
                                    .setColor(ee.color)
                                    .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                    .setTitle('• Daily')
                                    .setDescription(`\nHere's your daily Shimmers! \n\nYou got 500 <a:Shimmers:729388357410619505>!\n──────── ⋅⋆ ─ ⋆⋅ ────────`)]
                            }
                            )
                        }
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

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
