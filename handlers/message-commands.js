const { readdirSync } = require("fs");
module.exports = (client) => {
    try {
        readdirSync("./message-commands/").forEach((dir) => {
            const commands = readdirSync(`./message-commands/${dir}/`).filter((file) => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../message-commands/${dir}/${file}`);
                 
                client.messageCommands.set(pull.name, pull)
            }
        });
    } catch (e) {
        console.log(e.stack)
    }
};
