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
    name: "give",
    category: "Economy",
    aliases: ["add-money"],
    cooldown: 2,
    usage: "give <@user> <value>",
    description: "Give shims to anyone in the server.",
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
                let profile = message.mentions.members.first() || client.guilds.cache.get(message.guild.id).members.cache.get(args[0])
                if (!profile) return message.channel.send({ embeds: [{ color: ee.color, description: 'Missing user.' }] })

                if (!args[1]) return message.channel.send({ embeds: [{ color: ee.color, description: 'Please specify amount.' }] })
                let shims = parseInt(args[1])
                if (isNaN(shims)) return message.channel.send({ embeds: [{ color: ee.color, description: 'I need whole number.' }] })

                let result
                await sql.connect(sqlConfig)
                result = await sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`
                if (result.recordset[0]) {
                    await sql.query`UPDATE Economy SET shims = ${result.recordset[0].shims + shims} WHERE userID = ${profile.id}`
                    result = await sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.color)
                            .setTitle('Shimmers! Shimmers! <a:Shimmers:729388357410619505>')
                            .setDescription(`──────── ⋅⋆ ─ ⋆⋅ ────────\n\n**${message.author} is generating ${addCommas(shims)}<a:Shimmers:729388357410619505> to ${profile} \n\n──────── ⋅⋆ ─ ⋆⋅ ────────**`)
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                    }
                    )
                }
                else {
                    await sql.query`INSERT INTO Economy(userID, shims, daily) VALUES(${profile.id}, ${shims}, 0)`
                    result = await sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.color)
                            .setTitle('Shimmers! Shimmers! <a:Shimmers:729388357410619505>')
                            .setDescription(`──────── ⋅⋆ ─ ⋆⋅ ────────\n\n**${message.author} is generating ${addCommas(shims)}<a:Shimmers:729388357410619505> to ${profile} \n\n──────── ⋅⋆ ─ ⋆⋅ ────────**`)
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })]
                    }
                    )
                }
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

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
