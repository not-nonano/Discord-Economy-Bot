const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()
const fs = require('fs');

const commands = [];
fs.readdirSync("./commands/").forEach((dir) => {
    const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${dir}/${file}`);
        commands.push(command.data.toJSON());
        
    } 
});

// Place your client and guild ids here
const clientId = '';
const guildId = '';


const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();