const { MessageEmbed, Client, Message, GuildMember } = require("discord.js");
const ee = require("../../botconfig/embed.json");

const sql = require('mssql')
const sqlConfig = {
    user: 'sa',
    password: 'defaultpassword123',
    database: 'TheShackPH',
    server: 'localhost',
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
    name: "permission",
    category: "Administration",
    aliases: ["perms"],
    cooldown: 2,
    usage: "perms <allow | deny> <role | user> <module>",
    description: "Gives the permission to each module",
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
                if (user.id !== '428832564514390019')
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("❌ Error | You are not allowed to run this command!")
                        .setDescription(`You dont have permission to use this module.`)
                    )

                if (!args[0])
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("Wrong Command Usage")
                        .setDescription(`Usage: ${prefix}channel-override <allow | deny> <module>`)
                    )

                if (!(message.guild.roles.cache.get(args[1].replace(/\D/g, '')) || message.guild.members.cache.get(args[1].replace(/\D/g, ''))))
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("Wrong Command Usage")
                        .setDescription(`Usage: ${prefix}permission <allow | deny> <role | user> <module>`)
                    )

                if (!['allow', 'deny'].includes(args[0].toLowerCase()))
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("Wrong Command Usage")
                        .setDescription(`Usage: ${prefix}permission <allow | deny> <role | user> <module>`)
                    )

                let cmd = client.commands.get(args[2].toLowerCase()) || client.commands.get(client.aliases.get(args[2].toLowerCase()));
                if (!cmd)
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("Wrong Command Usage")
                        .setDescription(`Usage: ${prefix}permission <allow | deny> <role | user> <module>`)
                    )

                if (!cmd.perms)
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setDescription(`Notice: ${cmd.name} is open for \`@everyone\``)
                    )


                //if roles
                let guildRole = (message.guild.roles.cache.get(args[1].replace(/\D/g, ''))) ? message.guild.roles.cache.get(args[1].replace(/\D/g, '')) : false
                let guildMember = (message.guild.members.cache.get(args[1].replace(/\D/g, ''))) ? message.guild.members.cache.get(args[1].replace(/\D/g, '')) : false
                if (guildRole) {
                    if (args[0].toLowerCase() == 'allow') {
                        let result
                        await sql.connect(sqlConfig)
                        result = await sql.query(`SELECT * FROM Permission WHERE moduleName = '${cmd.name}' AND roleID = '${guildRole.id}'`)
                        if (!result.recordset[0]) {
                            await sql.query(`INSERT INTO Permission(moduleName, roleID) VALUES('${cmd.name}', ${guildRole.id})`)
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**Update:** ${guildRole.name} **ALLOWED** to run **${cmd.name}** module`)
                            )
                        } else {
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**Notice:** ${guildRole.name} is already enabled to run **${cmd.name}** module`)
                            )
                        }
                    }
                    if (args[0].toLowerCase() == 'deny') {
                        let result
                        await sql.connect(sqlConfig)
                        result = await sql.query(`SELECT * FROM Permission WHERE moduleName = '${cmd.name}' AND roleID = '${guildRole.id}'`)
                        if (result.recordset[0]) {
                            await sql.query(`DELETE FROM Permission WHERE moduleName = '${cmd.name}' AND roleID = '${guildRole.id}'`)
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**DELETED:** ${guildRole.name} is now **DENIED** to run **${cmd.name}** module`)
                            )
                        } else {
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**Notice:** ${guildRole.name} is already disabled to run **${cmd.name}** module`)
                            )
                        }
                    }
                }
                //if member
                if (guildMember) {
                    if (args[0].toLowerCase() == 'allow') {
                        let result
                        await sql.connect(sqlConfig)
                        result = await sql.query(`SELECT * FROM Permission WHERE moduleName = '${cmd.name}' AND userID = '${guildMember.id}'`)
                        if (!result.recordset[0]) {
                            await sql.query(`INSERT INTO Permission(moduleName, userID) VALUES('${cmd.name}', ${guildMember.id})`)
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**Update:** ${guildMember.user.tag} **ALLOWED** to run **${cmd.name}** module`)
                            )
                        } else {
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**Notice:** ${guildMember.user.tag} is already enabled to run **${cmd.name}** module`)
                            )
                        }
                    }
                    if (args[0].toLowerCase() == 'deny') {
                        let result
                        await sql.connect(sqlConfig)
                        result = await sql.query(`SELECT * FROM Permission WHERE moduleName = '${cmd.name}' AND userID = '${guildMember.id}'`)
                        if (result.recordset[0]) {
                            await sql.query(`DELETE FROM Permission WHERE moduleName = '${cmd.name}' AND userID = '${guildMember.id}'`)
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**DELETED:** ${guildMember.user.tag} is now **DENIED** to run **${cmd.name}** module`)
                            )
                        } else {
                            return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setDescription(`**Notice:** ${guildMember.user.tag} is already disabled to run **${cmd.name}** module`)
                            )
                        }
                    }

                }

            } catch (e) {
                console.log(String(e.stack).bgRed)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setFooter(ee.footertext, ee.footericon)
                    .setTitle(`❌ ERROR | An error occurred`)
                    .setDescription(`\`\`\`${e.stack}\`\`\``)
                );
            }
        }
}

/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
