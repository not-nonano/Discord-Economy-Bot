const { readdirSync } = require("fs");
module.exports = (client) => {
    try {
        readdirSync("./events/").forEach((dir) => {
            const eventFiles = readdirSync(`./events/${dir}/`).filter((file) => file.endsWith(".js"));
            for (const file of eventFiles) {
                const event = require(`../events/${dir}/${file}`);
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            }
        });
    } catch (e) {
        console.log(e.stack)
    }
}
