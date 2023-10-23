import { Guild, Message, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import ScriptBot from "./ScriptBot.js";
import { MemberManager, RoleManager } from "./Engine.js";
import { Sequence } from "tinylazyseq/dist/src/Sequence.js";

// carries context
class Dollar {
    public client: ScriptBot;
    public message: Message;
    public guild: Guild;
    public channel: TextChannel | NewsChannel | ThreadChannel;

    public reply: Promise<Message> | null;
    public members: MemberManager;
    public roles: RoleManager;

    public Sequence: typeof Sequence;

    constructor(client: ScriptBot, message: Message) {
        this.client = client;
        this.message = message;
        this.guild = message.guild!;
        this.channel = message.channel as any;
        this.reply = message.reference ? message.channel.messages.fetch(message.reference!.messageId!) : null
        this.members = new MemberManager(this.client, this.guild);
        this.roles = new RoleManager(this.client, this.guild);
        this.Sequence = Sequence;
    }

    public async then<T>(mapper: (dollar: Dollar) => Promise<T>): Promise<T> {
        return await mapper(this);
    }
}

let $: Dollar;

export default class MessageCreate {
    static async handle(client: ScriptBot, message: Message): Promise<boolean> {
        if (!message.guild) { return false; }
        if (!message.member?.permissions.has("Administrator")) { return false; }

        let content: string = message.content;
        if (content.startsWith("```")) content = content.slice(3).slice(0, -3);
        if (content.startsWith("js")) content = content.slice(2);

        if (!content.trim().startsWith("$.")) { return false; }

        $ = new Dollar(client, message);

        try {
            eval(content);
        } catch(error) {
            message.channel.send(`${(error as Error).name}: ${(error as Error).message}`);
            return false;
        }
        return true;
    }
}
