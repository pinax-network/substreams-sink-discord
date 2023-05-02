import { logger } from "substreams-sink";
import { Client, TextChannel, User, ThreadChannel, DiscordAPIError } from "discord.js";
import { z } from "zod";

export const DiscordConfigSchema = z.object({
    type: z.enum(['channel', 'user']).default('channel'),
    tts: z.boolean().default(false),
});

export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;

export class Discord {
    private readonly client: Client;

    private isInit: boolean = false;

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

        this.isInit = true;
    }

    public async sendMessage(chatId: string, message: string, config: DiscordConfig) {
        if (!this.isInit) {
            logger.error('Discord not initialized. You need to run Discord.init() first.');
            process.exit(1);
        }

        try {
            let receiver: User | TextChannel | ThreadChannel;
            switch (config.type) {
                case 'user':
                    // Check in cache for user
                    receiver = this.client.users.cache.get(chatId) as User;
                    // Or fetch user
                    if (!receiver)
                        receiver = await this.client.users.fetch(chatId) as User;
                    break;
                case 'channel':
                    // Check in cache for channel
                    receiver = this.client.channels.cache.get(chatId) as TextChannel | ThreadChannel;
                    // Or fetch channel
                    if (!receiver)
                        receiver = await this.client.channels.fetch(chatId) as TextChannel | ThreadChannel;
                    break;
                default:
                    break;
            }

            await receiver!.send({ content: message, tts: config.tts });
        } catch (error: any | DiscordAPIError) {
            if (error instanceof DiscordAPIError) {
                logger.error({ status: error.status, code: error.code, message: error.message });
            } else {
                logger.error('failed to send message');
            }
        }
    }
}