import { GatewayIntentBits } from 'discord.js';
import ScriptBot from './modules/ScriptBot.js';
import MessageCreate from './modules/MessageCreate.js';

(
async function main(args?: string[]): Promise<void> {
    const client = new ScriptBot({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.MessageContent
        ]
    });

    client.on("ready", _ => {
        console.log("ready!");
    })

    client.on("messageCreate", async message => {
        await MessageCreate.handle(client, message);
    })

    client.login(ScriptBot.config.token);
}
)(process.argv);