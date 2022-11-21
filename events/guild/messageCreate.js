const { Message } = require('discord.js')

let quizdrop = require('../../message-commands/Extra/quizdrop')
let shimdrop = require('../../message-commands/Economy/shimdrop')
let shimdrop2 = require('../../extras/shimdrop')

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

let activeChecker = shimdrop.activeChecker


module.exports = {
    name: 'messageCreate',
    /**
     * 
     * @param {Message} message 
     * @returns 
     */
    async execute(message) {
        try {
            //if the message is not in a guild (aka in dms), return aka ignore the inputs
            //if (!message.guild) return;
            // if the message  author is a bot, return aka ignore the inputs
            if (message.author.bot) return;
            //if the channel is on partial fetch it
            if (message.channel.partial) await message.channel.fetch();
            //if the message is on partial fetch it
            if (message.partial) await message.fetch();

            if (activeChecker.has(message.channel.id)) {
                let channelUpdate = activeChecker.get(message.channel.id)
                //event to check if channel is active
                if (channelUpdate.status == 'ready') {
                    let channelTime = channelUpdate.lastTime - (Date.now() - 60000)
                    //if timeout reset
                    if (channelTime < 0) {
                        channelUpdate.messageCount = 1
                        channelUpdate.lastTime = Date.now()
                    }
                    //if not, add message count
                    else if (channelTime > 0) {
                        channelUpdate.messageCount += 1
                    }

                    if (channelUpdate.messageCount >= 17) {
                        channelUpdate.status = 'active'
                        shimdrop2.pickRandomShimdrop(client, message.channel.id, channelUpdate)
                    }
                }

            }

            let ChannelCollection = quizdrop.channelcollection
            let reward = quizdrop.reward
            if (ChannelCollection.size > 0) {
                let answer = ChannelCollection.get(message.channel.id)

                if (answer?.answer) {
                    if (answer.answer.toLowerCase() == message.content.toLowerCase()) {

                        ChannelCollection.keyArray().forEach(function (res, index) {
                            message.guild.channels.cache.get(res).send(`${message.author} got the correct answer from ${message.channel}!`, { allowedMentions: { users: [] } })
                            message.client.guilds.cache.get('591859735976869888').channels.cache.get('713663287564304405').send(
                                {
                                    embed: {
                                        color: '00fbff',
                                        title: `Shimmers! Shimmers! <a:Shimmers:729388357410619505>`,
                                        description: `──────── ⋅⋆ ─ ⋆⋅ ────────\n\n**<@720494791846133790> is generating ${addCommas(answer.reward)}<a:Shimmers:729388357410619505> to ${message.author} \n\n──────── ⋅⋆ ─ ⋆⋅ ────────**`,
                                        footer: { text: 'The Shack PH ' }
                                    }
                                }
                            )
                        })
                        ChannelCollection.clear()

                        sql.connect(sqlConfig).then(() => {
                            return sql.query`SELECT * FROM Economy WHERE userID = ${message.author.id}`
                        }).then(async result => {
                            if (result.recordset[0]) {
                                await sql.query`UPDATE Economy SET shims = ${result.recordset[0].shims + reward} WHERE userID = ${message.author.id}`
                                result = await sql.query`SELECT * FROM Economy WHERE userID = ${message.author.id}`
                                return client.guilds.cache.get('591859735976869888').channels.cache.get('713663287564304405').send(`${message.author}`, {
                                    allowedMentions: { users: [] },
                                    embed: {
                                        color: ee.color,
                                        title: 'Shimmers! Shimmers! <a:Shimmers:729388357410619505>',
                                        description: `──────── ⋅⋆ ─ ⋆⋅ ────────\n\n**${message.client.user} is generating ${addCommas(reward)}<a:Shimmers:729388357410619505> to ${message.author} \n\n──────── ⋅⋆ ─ ⋆⋅ ────────**`,
                                        footer: {
                                            text: ee.footertext,
                                            icon_url: message.guild.iconURL()
                                        }
                                    }
                                })
                            }
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            }

            //get the current prefix from the botconfig/config.json
            let prefix = 'sm.'
            //the prefix can be a Mention of the Bot / The defined Prefix of the Bot
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
            //if its not that then return
            if (!prefixRegex.test(message.content)) return;
            //now define the right prefix either ping or not ping
            const [, matchedPrefix] = message.content.match(prefixRegex);
            //create the arguments with sliceing of of the rightprefix length
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
            //creating the cmd argument by shifting the args by 1
            const cmd = args.shift().toLowerCase();
            //if no cmd added return error
            if (cmd.length === 0) {
                if (matchedPrefix.includes(client.user.id))
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(ee.color)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle(`Hugh? I got pinged? Imma give you some help`)
                        .setDescription(`To see all Commands type: \`${prefix}help\``)
                    );
                return;
            }
            //get the command from the collection
            let command = client.commands.get(cmd);
            //if the command does not exist, try to get it by his alias
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            //if the command is now valid
            if (command) {
                if (!client.cooldowns.has(command.name)) { //if its not in the cooldown, set it too there
                    client.cooldowns.set(command.name, new Discord.Collection());
                }
                const now = Date.now(); //get the current time
                const timestamps = client.cooldowns.get(command.name); //get the timestamp of the last used commands
                const cooldownAmount = (command.cooldown || config.defaultCommandCooldown) * 1000; //get the cooldownamount of the command, if there is no cooldown there will be automatically 1 sec cooldown, so you cannot spam it^^
                if (timestamps.has(message.author.id)) { //if the user is on cooldown
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount; //get the amount of time he needs to wait until he can run the cmd again
                    if (now < expirationTime) { //if he is still on cooldonw
                        const timeLeft = (expirationTime - now) / 1000; //get the lefttime
                        return message.channel.send(new Discord.MessageEmbed()
                            .setColor(ee.wrongcolor)
                            .setFooter(ee.footertext, ee.footericon)
                            .setTitle(`❌ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
                        ); //send an information message
                    }
                }
                timestamps.set(message.author.id, now); //if he is not on cooldown, set it to the cooldown
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); //set a timeout function with the cooldown, so it gets deleted later on again
                try {
                    //try to delete the message of the user who ran the cmd
                    //try { message.delete(); } catch { }

                    //if the module is disabled on that channel
                    if (message.author.id !== '428832564514390019') {
                        let result
                        await sql.connect(sqlConfig)
                        result = await sql.query(`SELECT * FROM Channel WHERE channelID = '${message.channel.id}' AND moduleName = '${command.name}'`)
                        if (result.recordset[0]) {
                            return message.channel.send(new Discord.MessageEmbed()
                                .setColor(ee.wrongcolor)
                                .setFooter(ee.footertext, ee.footericon)
                                .setTitle("❌ Error | Module disabled")
                                .setDescription(`you are not allowed to run this module here in channel.`)
                            ).then(msg => msg.delete({ timeout: 5000 }).catch(e => console.log("Couldn't Delete --> Ignore".gray)));
                        }
                    }

                    //if Command has specific permission return error
                    if (command.perms && message.author.id !== '428832564514390019') {
                        let result
                        await sql.connect(sqlConfig)
                        result = await sql.query(`SELECT * FROM Permission WHERE userID = '${message.author.id}' AND moduleName = '${command.name}'`)
                        if (!result.recordset[0]) {
                            result = await sql.query(`SELECT roleID FROM Permission WHERE moduleName = '${command.name}'`)
                            let arrayRoleID = []
                            result.recordset.forEach(value => { arrayRoleID.push(value.roleID) })
                            if (!message.member.roles.cache.some(r => arrayRoleID.includes(r.id)))
                                return message.channel.send(new Discord.MessageEmbed()
                                    .setColor(ee.wrongcolor)
                                    .setFooter(ee.footertext, ee.footericon)
                                    .setTitle("❌ Error | You are not allowed to run this command!")
                                    .setDescription(`You dont have permission to use this module.`)
                                ).then(msg => msg.delete({ timeout: 5000 }).catch(e => console.log("Couldn't Delete --> Ignore".gray)));
                        }
                    }

                    //if the Bot has not enough permissions return error
                    /*let required_perms = ["ADD_REACTIONS", "PRIORITY_SPEAKER", "VIEW_CHANNEL", "SEND_MESSAGES",
                      "EMBED_LINKS", "CONNECT", "SPEAK", "DEAFEN_MEMBERS"]
                    if (!message.guild.me.hasPermission(required_perms)) {
                      try { message.react("❌"); } catch { }
                      return message.channel.send(new Discord.MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("❌ Error | I don't have enough Permissions!")
                        .setDescription("Please give me just `ADMINISTRATOR`, because I need it to delete Messages, Create Channel and execute all Admin Commands.\n If you don't want to give me them, then those are the exact Permissions which I need: \n> `" + required_perms.join("`, `") + "`")
                      )
                    }
                    */
                    //run the command with the parameters:  client, message, args, user, text, prefix,
                    command.run(client, message, args, message.member, args.join(" "), prefix);
                } catch (e) {
                    console.log(String(e.stack).red)
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle("❌ Something went wrong while, running the: `" + command.name + "` command")
                        .setDescription(`\`\`\`${e.message}\`\`\``)
                    ).then(msg => msg.delete({ timeout: 5000 }).catch(e => console.log("Couldn't Delete --> Ignore".gray)));
                }
            }
        } catch (e) {
            return console.log(e)
        }
        /**
          * @INFO
          * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template
          * @INFO
          * Work for Milrato Development | https://milrato.eu
          * @INFO
          * Please mention Him / Milrato Development, when using this Code!
          * @INFO
        */
    }
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}