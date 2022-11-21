const { MessageCollector, ReactionCollector, MessageAttachment, Client } = require('discord.js')
const Canvas = require('@napi-rs/canvas')
const sql = require('mssql')
let shimdrop = require('../message-commands/Economy/shimdrop')
let activeChecker = shimdrop.activeChecker

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
    pickRandomShimdrop(client, channelID, channelUpdate) {
        let mode = (Math.floor(Math.random() * (4 - 1 + 1)) + 1)

        if (mode == 1) {
            simpleMath(client, channelID)
        } else if (mode == 2) {
            randomCode(client, channelID)
        } else if (mode == 3) {
            randomReact(client, channelID)
        } else if (mode == 4) {
            colorpicker(client, channelID)
        } else {
            console.log('ewan')
        }
    }
}

/**
* @param {Client} client
* @param {String} channel
*/
function simpleMath(client, id, channelUpdate) {
    let chat

    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${id}`
    }).then(async result => {
        chat = client.guilds.cache.get(result.recordset[0].guildID).channels.cache.get(id)

        let num1 = generateNumber((Math.floor(Math.random() * (2 - 1 + 1)) + 1))
        let num2 = generateNumber((Math.floor(Math.random() * (2 - 1 + 1)) + 1))
        
        let answer = num1 + num2

        chat.send({
            embed: {
                color: 0x0099ff,
                title: '<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>',
                description: `Simple Math\n\n ${num1} + ${num2} = n`,
                footer: {
                    text: 'The Shack PH'
                }

            }
        }).then(msg => {

            const filter = m => !m.author.bot;
            const collector = new MessageCollector(msg.channel, filter, { time: 60000 })

            collector.on('collect', collected => {
                if (collected.content == answer) {
                    collected.reply('you got it')
                    reward(client, collected.author.id, result.recordset[0].reward)
                    collector.stop()
                }
            })

            collector.on('end', () => {
                activeChecker.get(id).status = 'preparing'
            })
        })
    }).catch(err => {
        console.log(err)
    })
}

let choices = ['🔴', '🔵', '🟢', '🟡', '🟠']
/**
* @param {Client} client
* @param {String} channel
*/
async function colorpicker(client, id, channelUpdate) {
    let chat

    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${id}`
    }).then(async result => {
        chat = client.guilds.cache.get(result.recordset[0].guildID).channels.cache.get(id)

        chat.send({
            embed: {
                color: 0x0099ff,
                title: '<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>',
                description: `Reacting colors...\n\nPlease wait...`,
                footer: {
                    text: 'The Shack PH'
                }
            }
        }).then(async msg => {
            await msg.react('🔴')
            await msg.react('🔵')
            await msg.react('🟢')
            await msg.react('🟡')
            await msg.react('🟠')

            choose(client, id, msg, Math.floor(Math.random() * choices.length), channelUpdate)
        })
    }).catch(err => {
        console.log(err)
    })

}
/**
* @param {Client} client
* @param {String} channel
*/
async function choose(client, id, msg, answer, channelUpdate) {
    let chat

    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${id}`
    }).then(async result => {
        chat = client.guilds.cache.get(result.recordset[0].guildID).channels.cache.get(id)

        await msg.edit({
            embed: {
                color: 0x0099ff,
                title: '<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>',
                description: `First one to react at ${choices[answer]} wins`,
                footer: {
                    text: 'The Shack PH'
                }
            }
        })
        const filter = (reaction, user) => {
            return choices.includes(reaction.emoji.name) && !user.bot;
        }

        const collector = new ReactionCollector(msg, filter, { time: 60000 })

        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name == choices[answer]) {
                chat.send(`${user}, you got it!`)

                reward(client, user.id, result.recordset[0].reward)
                collector.stop()
            }
        })

        collector.on('end', () => {
            activeChecker.get(id).status = 'preparing'
        })
    }).catch(err => {
        console.log(err)
    })

}
/**
* @param {Client} client
* @param {String} channel
*/
async function randomCode(client, id, channelUpdate) {
    let chat

    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${id}`
    }).then(async result => {
        chat = client.guilds.cache.get(result.recordset[0].guildID).channels.cache.get(id)

        let code = generateRandom(6)
        let shuffle_code = shuffle(code)

        const canvas = Canvas.createCanvas(500, 200);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./img/RC.png')
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Code 1:', 230, 98);
        ctx.font = '20px sans-serif';
        ctx.fillText(shuffle_code[0], 315, 98);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Code 2:', 230, 138);
        ctx.font = '20px sans-serif';
        ctx.fillText(shuffle_code[1], 315, 138);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Code 3:', 230, 178);
        ctx.font = '20px sans-serif';
        ctx.fillText(shuffle_code[2], 315, 178);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'code.png');

        chat.send({
            embed: {
                color: 0x0099ff,
                title: '<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>',
                description: `There's only one code among us`,
                image: {
                    url: 'attachment://code.png'
                },
                footer: {
                    text: 'The Shack PH'
                }

            },
            files: [attachment]
        }).then(msg => {

            const filter = m => !m.author.bot;
            const collector = new MessageCollector(msg.channel, filter, { time: 60000, errors: ['time'] })

            collector.on('collect', collected => {
                if (collected.content == code) {
                    collected.reply('you got it')
                    reward(client, collected.author.id, result.recordset[0].reward)
                    collector.stop()
                }
            })

            collector.on('end', () => {
                activeChecker.get(id).status = 'preparing'
            })
        })
    }).catch(err => {
        console.log(err)
    })
}
/**
* @param {Client} client
* @param {String} channel
*/
function randomReact(client, id, channelUpdate) {
    let chat

    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Shimdrop WHERE channelID = ${id}`
    }).then(async result => {
        chat = client.guilds.cache.get(result.recordset[0].guildID).channels.cache.get(id)

        let emoji = client.guilds.cache.get('591859735976869888').emojis.cache.get('727028870569525320')
        chat.send({
            embed: {
                color: 0x0099ff,
                title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>`,
                description: `React to join ShimDrops under 10 seconds`,
                footer: {
                    text: 'The Shack PH'
                }
            }
        }).then(message => {
            message.react(emoji)

            const filter = (reaction, user) => {
                return reaction.emoji.name === emoji.name && !user.bot;
            }

            const collector = new ReactionCollector(message, filter, { dispose: true, time: 10000 })
            let participant = []

            collector.on("collect", (reaction, user) => {
                participant.push(user.id)
            })

            collector.on('remove', (reaction, user) => {
                participant.splice(participant.indexOf(user.id), 1)
            })

            collector.on('end', () => {
                if (participant.length == 0) {
                    message.edit({
                        embed: {
                            color: 0x0099ff,
                            title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>`,
                            description: `No one joined on ShimDrop.`,
                            footer: {
                                text: 'The Shack PH'
                            }
                        }
                    })
                    message.reactions.removeAll().catch()
                    activeChecker.get(id).status = 'preparing'
                } else {
                    let winner = Math.floor(Math.random() * participant.length)
                    message.edit({
                        embed: {
                            color: 0x0099ff,
                            title: `<a:uuYllwShk_Shimmer:727028870569525320> Shimmer Drop!! Shimmer Drop!! <a:uuYllwShk_Shimmer:727028870569525320>`,
                            description: `Winner: <@${participant[winner]}>`,
                            footer: {
                                text: 'The Shack PH'
                            }
                        }
                    })
                    chat.send(`You won <@${participant[winner]}>!`)
                    reward(client, participant[winner], result.recordset[0].reward)
                    activeChecker.get(id).status = 'preparing'
                }
            })
        })
    }).catch(err => {
        console.log(err)
    })
}
/**
* @param {Number} length
*/
function generateRandom(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function shuffle(code) {
    let arr = []
    let place = Math.floor(Math.random() * 3)
    for (i = 0; i <= 2; i++) {
        if (i == place) {
            arr.push(code)
        } else {
            arr.push(generateRandom(6))
        }

    }
    return arr
}

function generateNumber(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result);
}

/**
* @param {Client} client
* @param {String} channel
* @param {Number} reward
*/
async function reward(client, authorID, reward) {
    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM Economy WHERE userID = ${authorID}`
    }).then(async result => {
        sql.query`UPDATE Economy SET shims = ${result.recordset[0].shims + parseInt(reward)} WHERE userID = ${authorID}`
        client.guilds.cache.get('591859735976869888').channels.cache.get('713663287564304405').send(
            {
                embed: {
                    color: '00fbff',
                    title: `Shimmers! Shimmers! <a:Shimmers:729388357410619505>`,
                    description: `──────── ⋅⋆ ─ ⋆⋅ ────────\n\n**<@720494791846133790> is generating ${addCommas(reward)}<a:Shimmers:729388357410619505> to ${client.users.cache.get(authorID)} \n\n──────── ⋅⋆ ─ ⋆⋅ ────────**`,
                    footer: { text: 'The Shack PH ' }
                }
            }
        )
    }).catch(err => {
        console.log(err)
    })
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}