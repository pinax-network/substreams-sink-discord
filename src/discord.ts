import { logger } from "substreams-sink";
import { Client, TextChannel, User, DiscordAPIError } from "discord.js";

export interface DiscordConfig {
    entity: string;
    parse_mode?: string;
    chat_ids: string[];
    message: string;
}

export class Discord {
    private readonly client: Client;

    constructor() {
        this.client = new Client({
            intents: []
        });
    }

    public async init(token: string) {
        try {
            await this.client.login(token);
        } catch (error) {
            logger.error('unable to login to Discord');
            process.exit(1);
        }
    }

    public async sendMessage(channelId: string, message: string) {
        try {
            // Check in cache
            let channel: TextChannel = this.client.channels.cache.get(channelId) as TextChannel;

            // Or fetch
            if (!channel)
                channel = await this.client.channels.fetch(channelId) as TextChannel;

            await channel.send(message);

            // await (await this.client.users.fetch(userId)).send(message);
        } catch (error: any | DiscordAPIError) {
            if (error instanceof DiscordAPIError) {
                logger.error({ status: error.status, code: error.code, message: error.message });
            } else {
                logger.error('failed to send message');
            }
        }
    }
}