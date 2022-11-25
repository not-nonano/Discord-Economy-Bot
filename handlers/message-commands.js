const { readdirSync } = require("fs");
module.exports = (client) => {
    try {
        readdirSync("./message-commands/").forEach((dir) => {
            const commands = readdirSync(`./message-commands/${dir}/`).filter((file) => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../message-commands/${dir}/${file}`);

                client.messageCommands.set(pull.name, pull)

                if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
            }
        });
    } catch (e) {
        console.log(e.stack)
    }
};
