const {Client} = require('discord.js')

module.exports = {
    name: 'ready',
    once: true,
    /**
     * 
     * @param {Client} client 
     */
    execute(client) {
        client.guilds.fetch("591859735976869888").then(value => value.members.fetch())
        console.log('Ready!')
    }
}