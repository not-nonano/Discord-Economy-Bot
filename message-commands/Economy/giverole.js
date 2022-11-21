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
    name: "giverole",
    category: "Economy",
    aliases: [""],
    cooldown: 2,
    usage: "giverole <mention role/roleID> <amount of shimmers>",
    description: "Add shimmers for those who have that role",
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
                if (message.channel.type == 'dm') return

                let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
                if (!role) return message.channel.send({ embed: { color: 'ff2e54', description: 'Missing role.' } })
                let memID = await message.guild.roles.cache.get(role.id).members.map(m => m.user.id).join(' ').split(' ')

                if (!args[1]) return message.channel.send({ embed: { color: 'ff2e54', description: 'Please specify amount.' } })
                let shims = parseInt(args[1])
                if (isNaN(shims)) return message.channel.send({ embed: { color: 'ff2e54', description: 'I need whole number.' } })

                message.channel.send({
                    embed:
                    {
                        color: '00fbff',
                        title: `Shimmers! Shimmers! <a:Shimmers:729388357410619505>`,
                        description: `──────── ⋅⋆ ─ ⋆⋅ ────────**\n\nTrying to generate ${memID.length}\n\n**──────── ⋅⋆ ─ ⋆⋅ ────────`,
                        footer: { text: 'The Shack PH ' }
                    }
                }).then(msg => {
                    msg.delete({ timeout: 2000 })
                })


                memID.forEach(async value => {
                    let profile = client.users.cache.get(value)
                    let result
                    await sql.connect(sqlConfig)
                    result = await sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`

                    if (result.recordset[0]) {
                        await sql.query`UPDATE Economy SET shims = ${result.recordset[0].shims + shims} WHERE userID = ${profile.id}`
                        result = await sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`
                    }
                    else {
                        await sql.query`INSERT INTO Economy(userID, shims, daily) VALUES(${profile.id}, ${shims}, 0)`
                        result = await sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`
                    }
                })
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.color)
                    .setTitle('Shimmers! Shimmers! <a:Shimmers:729388357410619505>')
                    .setDescription(`──────── ⋅⋆ ─ ⋆⋅ ────────\n\n**${message.author} is generating ${addCommas(shims)}<a:Shimmers:729388357410619505> \nto ${role} with ${memID.length} members\n\n──────── ⋅⋆ ─ ⋆⋅ ────────>**`)
                    .setFooter(ee.footertext, message.guild.iconURL())
                )
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
