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
    name: "transfer",
    category: "Economy",
    aliases: [""],
    cooldown: 2,
    usage: "transfer <from User> <to User> <Amount>",
    description: "transfer shimmers to user.",
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
                let user1, user2

                //from
                await sql.connect(sqlConfig)
                user1 = await sql.query`SELECT * FROM Economy WHERE userID = ${args[0].replace(/\D/g, '')}`


                if (!user1.recordset[0])
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | ${client.users.cache.get(args[0].replace(/\D/g, '')).tag} doesn't have data.`)
                    );

                if (!parseInt(args[2]))
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | Missing Amount`)
                    );

                if (isNaN(args[2]))
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | The Amount you give is not a Number`)
                    );

                if (user1.recordset[0].shims < parseInt(args[2]))
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | Not Enough Shimmers from ${client.users.cache.get(args[0].replace(/\D/g, '')).tag}.`)
                    );

                //to
                await sql.connect(sqlConfig)
                user2 = await sql.query`SELECT * FROM Economy WHERE userID = ${args[1].replace(/\D/g, '')}`

                if (!user2.recordset[0])
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, message.guild.iconURL())
                        .setTitle(`❌ ERROR | ${client.users.cache.get(args[1].replace(/\D/g, '')).tag} doesn't have data.`)
                    );

                await sql.connect(sqlConfig)
                await sql.query`UPDATE Economy SET shims = ${user1.recordset[0].shims - parseInt(args[2])} WHERE userID = ${args[0].replace(/\D/g, '')}`
                await sql.query`UPDATE Economy SET shims = ${user2.recordset[0].shims + parseInt(args[2])} WHERE userID = ${args[1].replace(/\D/g, '')}`

                return message.channel.send(new MessageEmbed()
                    .setColor(ee.color)
                    .setFooter(ee.footertext, message.guild.iconURL())
                    .setTitle(`Transfer Complete!`)
                    .setDescription(`${client.users.cache.get(args[0].replace(/\D/g, ''))} -${addCommas(args[2])}<a:Shimmers:729388357410619505>\n${client.users.cache.get(args[1].replace(/\D/g, ''))} +${addCommas(args[2])}<a:Shimmers:729388357410619505>`)
                );
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

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */
