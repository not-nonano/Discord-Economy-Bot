const { readdirSync } = require("fs");
module.exports = (client) => {
    try {
        readdirSync("./commands/").forEach((dir) => {
            const commands = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../commands/${dir}/${file}`);
                 
                client.commands.set(pull.name, pull)
            }
        });
    } catch (e) {
        console.log(e.stack)
    }
};
