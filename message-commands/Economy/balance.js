const { MessageEmbed, Client, Message, GuildMember, MessageAttachment } = require("discord.js");
const ee = require("../../botconfig/embed.json");
const Canvas = require('@napi-rs/canvas')

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
    name: "balance",
    category: "Economy",
    aliases: ["bal", "b"],
    cooldown: 2,
    usage: "balance",
    description: "Check how much your balance",
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
                let profile = message.mentions.users.first() || client.users.cache.get(args[0])
                if (!profile) profile = message.author
                const canvas = Canvas.createCanvas(1726, 1024);
                const ctx = canvas.getContext('2d');

                const background = await Canvas.loadImage('././img/card.png')
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                sql.connect(sqlConfig).then(() => {
                    return sql.query`SELECT * FROM Economy WHERE userID = ${profile.id}`
                }).then(async result => {
                    if (result.recordset[0]) {

                        ctx.font = 'bold 90px sans-serif';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(addCommas(result.recordset[0].shims), 530, 430);
                        ctx.font = '70px Impact';
                        ctx.fillText(profile.id, 125, 720);
                        ctx.font = 'bold 70px Times New Roman';
                        ctx.fillText(profile.tag, 185, 850);

                        const attachment = new MessageAttachment(canvas.toBuffer(), 'code.png');
                        return message.channel.send(attachment)
                    }
                    else {
                        await sql.query`INSERT INTO Economy(userID, shims, daily) VALUES(${profile.id}, 0, 0)`
                        register(profile, message)
                    }
                }).catch(err => {
                    console.log(err)
                })

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

async function register(profile, message) {
    const canvas = Canvas.createCanvas(1726, 1024);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('././img/card.png')
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Economy WHERE userID = '${profile.id}'`
    }).then(async result => {

        if (result.recordset[0]) {

            ctx.font = 'bold 90px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(addCommas(result.recordset[0].shims), 530, 430);
            ctx.font = '70px Impact';
            ctx.fillText(profile.id, 125, 720);
            ctx.font = 'bold 70px Times New Roman';
            ctx.fillText(profile.tag, 185, 850);

            const attachment = new MessageAttachment(canvas.toBuffer(), 'code.png');
            return message.channel.send(attachment)
        }
    }).catch(err => {
        console.log(err)
    })

}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/** Template by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template */

/**
 * await sql.connect(sqlConfig)
                await sql.query(`SELECT * FROM Economy WHERE userID = ${profile.id}`, async function (err, result) {
                    if (result.recordset[0]) {

                        ctx.font = 'bold 90px sans-serif';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(addCommas(result.recordset[0].shims), 530, 430);
                        ctx.font = '70px Impact';
                        ctx.fillText(profile.id, 125, 720);
                        ctx.font = 'bold 70px Times New Roman';
                        ctx.fillText(profile.tag, 185, 850);

                        const attachment = new MessageAttachment(canvas.toBuffer(), 'code.png');
                        return message.channel.send(attachment)
                    }
                    else {
                        await sql.query(`INSERT INTO Economy(userID, shims, daily) VALUES(${user.id}, 0, 0);
                        SELECT * FROM Economy WHERE userID = ${user.id}`, function (err, result) {
                            ctx.font = 'bold 90px sans-serif';
                            ctx.fillStyle = '#ffffff';
                            ctx.fillText(addCommas(result.recordset[0].shims), 530, 430);
                            ctx.font = '70px Impact';
                            ctx.fillText(profile.id, 125, 720);
                            ctx.font = 'bold 70px Times New Roman';
                            ctx.fillText(profile.tag, 185, 850);

                            const attachment = new MessageAttachment(canvas.toBuffer(), 'code.png');
                            return message.channel.send(attachment)
                        });
                    }
                })
 */