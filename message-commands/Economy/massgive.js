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
    name: "massgive",
    category: "Economy",
    aliases: [""],
    cooldown: 2,
    usage: "massgive <Users> / Amount",
    description: "nyenyenye",
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
                let collected = content.split('/')
                let users = collected[0].split(" ")
                let count = 0

                if (!collected[1]) return message.channel.send({ embeds: [{ color: ee.color, description: 'Please specify amount.' }] })
                let shims = parseInt(collected[1])
                if (isNaN(shims)) return message.channel.send({ embeds: [{ color: ee.color, description: 'I need whole number.' } ]})

                users.forEach(async function (res, index) {
                    if (res == '') return
                    sql.connect(sqlConfig).then(() => {
                        return sql.query`SELECT * FROM Economy WHERE userID = ${res.replace(/\D/g, '')}`
                    }).then(async result => {
                        if (result.recordset[0]) {
                            console.log(result.recordset[0].shims + parseInt(collected[1]))
                            count = count + 1
                            await sql.connect(sqlConfig)
                            await sql.query`UPDATE Economy SET shims = ${result.recordset[0].shims + shims} WHERE userID = ${res.replace(/\D/g, '')}`
                        }
                        else {
                            count = count + 1
                            await sql.connect(sqlConfig)
                            await sql.query(`INSERT INTO Economy(userID, shims, daily) VALUES(${res.replace(/\D/g, '')}, ${shims}, 0)`)
                        }
                    }).catch(err => {
                        console.log(err)
                    })
                })

                users.forEach((result, index) => {
                    if (result == '') return
                    else count = count + 1
                })

                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(ee.color)
                        .setFooter({ text: ee.footertext, iconURL: message.guild.iconURL() })
                        .setTitle(`Shimmers! Shimmers! <a:Shimmers:729388357410619505>`)
                        .setDescription(`Generated ${addCommas(collected[1])} <a:Shimmers:729388357410619505> for ${count} users`)]
                }
                );



            } catch (e) {
                console.log(String(e.stack).bgRed)
                return message.channel.send({
                    embeds:     [new EmbedBuilder()
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
