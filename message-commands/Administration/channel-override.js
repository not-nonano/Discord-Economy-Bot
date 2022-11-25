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
    name: "channel-override",
    category: "Administration",
    aliases: [""],
    cooldown: 2,
    usage: "channel-override <allow | deny>",
    description: "Allows/Denies the module in specific channel",
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
                if (!user.hasPermission("ADMINISTRATOR") || user.id !== '428832564514390019')
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.wrongcolor)
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                            .setTitle("❌ Error | You are not allowed to run this command!")
                            .setDescription(`You dont have permission to use this module.`)]
                    }
                    )

                if (!args[0])
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.wrongcolor)
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                            .setTitle("Wrong Command Usage")
                            .setDescription(`Usage: ${prefix}channel-override <allow | deny> <module>`)]
                    }
                    )

                if (!['allow', 'deny'].includes(args[0].toLowerCase()))
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.wrongcolor)
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                            .setTitle("Wrong Command Usage")
                            .setDescription(`Usage: ${prefix}channel-override <allow | deny> <module>`)]
                    }
                    )

                let cmd = client.commands.get(args[1].toLowerCase()) || client.commands.get(client.aliases.get(args[1].toLowerCase()));
                if (!cmd)
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(ee.wrongcolor)
                            .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                            .setTitle("Wrong Command Usage")
                            .setDescription(`Usage: ${prefix}permission <allow | deny> <module>`)]
                    }
                    )

                if (args[0].toLowerCase() == 'allow') {
                    let result
                    await sql.connect(sqlConfig)
                    result = await sql.query(`SELECT * FROM Channel WHERE channelID = '${message.channel.id}' AND moduleName = '${cmd.name}'`)
                    if (result.recordset[0]) {
                        await sql.query(`DELETE FROM Channel WHERE channelID = '${message.channel.id}' AND moduleName = '${cmd.name}'`)
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.color)
                                .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                .setDescription(`**Update:** **${cmd.name}** is now **ALLOWED** to run in <#${message.channel.id}> `)]
                        }
                        )
                    } else {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.color)
                                .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                .setDescription(`**Notice:** **${cmd.name}** is already **ALLOWED** to run in <#${message.channel.id}> `)]
                        }
                        )
                    }
                }
                if (args[0].toLowerCase() == 'deny') {
                    let result
                    await sql.connect(sqlConfig)
                    result = await sql.query(`SELECT * FROM Channel WHERE channelID = '${message.channel.id}' AND moduleName = '${cmd.name}'`)
                    if (!result.recordset[0]) {
                        await sql.query(`INSERT INTO Channel(moduleName, channelID) VALUES('${cmd.name}', ${message.channel.id})`)
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.color)
                                .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                .setDescription(`**Update:** **${cmd.name}** is **DENIED** to run in <#${message.channel.id}> `)]
                        }
                        )
                    } else {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(ee.color)
                                .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                                .setDescription(`**Notice:** **${cmd.name}** is already **DENIED** to run in <#${message.channel.id}> `)]
                        }
                        )
                    }
                }

            } catch (e) {
                console.log(String(e.stack).bgRed)
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(ee.wrongcolor)
                        .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                        .setTitle(`❌ ERROR | An error occurred`)
                        .setDescription(`\`\`\`${e.stack}\`\`\``)]
                });
            }
        }
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
