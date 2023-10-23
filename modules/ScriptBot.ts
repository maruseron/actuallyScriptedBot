import config from "../config.js";
import { 
    Client, 
    ClientOptions, 
    Guild, 
    GuildMember, 
    Message, 
    Role, 
    User, 
    EmbedBuilder
} from "discord.js";

export default class ScriptBot extends Client {
    public static readonly config = config;

    public constructor(options: ClientOptions) {
        super(options);
    }

    public static async clean(text: string): Promise<string> {
        return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
            .replace(ScriptBot.config.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");
    }

    public static wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async awaitReply(
        msg: Message, 
        question: string, 
        limit: number = 60000
    ): Promise<string | null> {
        await msg.channel.send(question);
        try {
            const collected = await msg.channel.awaitMessages({ 
                filter: (m: Message) => m.author.id === msg.author.id, 
                max: 1, 
                time: limit, 
                errors: ["time"] 
            });
            return collected.first()?.content ?? null;
        } catch(e) {
            return null;
        }
    }

    public async baseEmbed(): Promise<EmbedBuilder | null> {
        if (!this.user) return null;
        else return new EmbedBuilder()
            .setTimestamp()
            .setFooter({ text: "Seiko", iconURL: this.user.displayAvatarURL() });
    }

    public async findUser(args: string): Promise<User | null> {
        let mention = args;
        if (mention.startsWith('<@') && mention.endsWith('>'))
            mention = mention.slice(2, -1);
        if (mention.startsWith('!'))
            mention = mention.slice(1);

        return this.users.cache.get(mention)
            ?? this.users.fetch(mention).catch(_ => null);
    }

    public async findMember(guild: Guild, args: string): Promise<GuildMember | null> {
        let mention = args;
        if (mention.startsWith('<@') && mention.endsWith('>')) 
            mention = mention.slice(2,-1)
		if (mention.startsWith('!')) 
            mention = mention.slice(1)
		const mentionAsRegExp = new RegExp(mention.toLowerCase())

        let member: GuildMember | undefined;
        let user = (this.users.cache.find(u => u.username.toLowerCase().match(mentionAsRegExp) != null)
            || this.users.cache.find(u => u.globalName?.toLocaleLowerCase().match(mentionAsRegExp) != null))
            ?? await this.users.fetch(mention).catch(_ => null)
        if (user) {
            member = guild.members.cache.get(user.id) 
                ?? guild.members.cache.find(m => m.displayName.toLowerCase().match(mentionAsRegExp) != null);
        }

        if (!member) return null;
        else return member;
    }

    public async findMemberStrict(guild: Guild, args: string): Promise<GuildMember | null> {
        let mention = args;
        if (mention.startsWith('<@') && mention.endsWith('>')) 
            mention = mention.slice(2,-1)
		if (mention.startsWith('!')) 
            mention = mention.slice(1)

        const user = await this.users.fetch(mention).catch(_ => null);
        if (!user) return null;
        else return guild.members.fetch(user) ?? null;
    }

    public static async findRole(guild: Guild, args: string): Promise<Role | null> {
		let mention = args;
		if (mention.startsWith('<@&') && mention.endsWith('>')) 
            mention = mention.slice(3,-1)
		const mentionAsRegExp = new RegExp(mention.toLowerCase())

		let role = guild.roles.cache.find(r => r.id == mention) 
            ?? guild.roles.cache.find(r => r.name.toLowerCase().match(mentionAsRegExp) != null);

		if (!role) return null;
		else return role;
	}
}