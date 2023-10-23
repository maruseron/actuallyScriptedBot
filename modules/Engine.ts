import { Guild, GuildMember, Role } from "discord.js";
import { AsyncSequence, Sequence } from "tinylazyseq";
import ScriptBot from "./ScriptBot.js";

function isNotNull<T>(t: T): t is NonNullable<T> {
    return t != null;
}

export interface EntityManager<T> {
    client: ScriptBot;
    guild: Guild;

    fromId(id: string): Promise<T | null>;
    fromIdList(...ids: string[]): Promise<T[]>;

    fromName(name: string): Promise<T | null>;
    fromNameList(...names: string[]): Promise<T[]>;

    all(): Promise<Sequence<T>>;
    allWhere(predicate: (item: T) => boolean): Promise<Sequence<T>>
}

abstract class AbstractEntityManager<T> implements EntityManager<T> {
    client: ScriptBot;
    guild: Guild;
    constructor(client: ScriptBot, guild: Guild) {
        this.client = client;
        this.guild  = guild;
    }

    abstract fromId(id: string): Promise<T | null>;
    abstract fromIdList(...ids: string[]): Promise<T[]>;

    abstract fromName(name: string): Promise<T | null>;
    abstract fromNameList(...names: string[]): Promise<T[]>;

    abstract all(): Promise<Sequence<T>>;
    public async allWhere(predicate: (item: T) => boolean): Promise<Sequence<T>> {
        return (await this.all()).filter(predicate);
    }
}

export class MemberManager extends AbstractEntityManager<GuildMember> {
    async fromId(id: string): Promise<GuildMember | null> {
        return this.client.findMemberStrict(this.guild!, id);
    }

    async fromIdList(...ids: string[]): Promise<GuildMember[]> {
        return AsyncSequence.from(ids.map(id  => this.client.findMemberStrict(this.guild!, id)))
            .filter<GuildMember>(isNotNull)
            .toArray();
    }

    async fromName(name: string): Promise<GuildMember | null> {
        const members = await this.guild.members.fetch();
        return Sequence.from(members.values())
            .find((item) => item.displayName === name
                || item.user.username === name
                || item.user.globalName === name)
            ?? null;
    }

    async fromNameList(...names: string[]): Promise<GuildMember[]> {
        const members = await this.guild.members.fetch();
        return Sequence.from(members.values())
            .filter(item => names.includes(item.displayName) 
                || names.includes(item.user.username) 
                || (item.user.globalName != null && names.includes(item.user.globalName)))
            .toArray();
    }

    async all(): Promise<Sequence<GuildMember>> {
        const members = await this.guild.members.fetch();
        return Sequence.from(members.values())
    }
}

export class RoleManager extends AbstractEntityManager<Role> {
    async fromId(id: string): Promise<Role | null> {
        return ScriptBot.findRole(this.guild!, id);
    }

    async fromIdList(...ids: string[]): Promise<Role[]> {
        return AsyncSequence.from(ids.map(id => ScriptBot.findRole(this.guild!, id)))
            .filter<Role>(isNotNull)
            .toArray();
    }

    async fromName(name: string): Promise<Role | null> {
        const roles = await this.guild.roles.fetch();
        return Sequence.from(roles.values())
            .find((item) => item.name === name)
            ?? null;
    }

    async fromNameList(...names: string[]): Promise<Role[]> {
        const roles = await this.guild.roles.fetch();
        return Sequence.from(roles.values())
            .filter(item => names.includes(item.name))
            .toArray();
    }

    async all(): Promise<Sequence<Role>> {
        const roles = await this.guild.roles.fetch();
        return Sequence.from(roles.values());
    }
}