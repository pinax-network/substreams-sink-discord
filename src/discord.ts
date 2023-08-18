import { logger } from "substreams-sink";
import { Client, TextChannel, User, ThreadChannel, DiscordAPIError, EmbedBuilder } from "discord.js";
import { z } from "zod";

export const DiscordConfigSchema = z.object({
    type: z.enum(['channel', 'user']).default('channel'),
    embed: z.any().optional(),
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

    private checkInit() {
        if (!this.isInit) {
            logger.error('Discord not initialized. You need to run Discord.init() first.');
            process.exit(1);
        }
    }

    private async getReceiver(chatId: string, config: DiscordConfig): Promise<User | TextChannel | ThreadChannel | undefined> {
        try {
            let receiver: User | TextChannel | ThreadChannel | undefined;
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
                    receiver = undefined;
                    break;
            }
            return receiver;
        } catch (error: any | DiscordAPIError) {
            if (error instanceof DiscordAPIError) {
                logger.error({ status: error.status, code: error.code, message: error.message });
            } else {
                logger.error('failed to get receiver');
            }
        }
    }

    public async sendTextMessage(chatId: string, message: string, config: DiscordConfig) {
        this.checkInit();

        try {
            let receiver: User | TextChannel | ThreadChannel | undefined = await this.getReceiver(chatId, config);
            await receiver!.send({ content: message, tts: config.tts });
        } catch (error: any | DiscordAPIError) {
            if (error instanceof DiscordAPIError) {
                logger.error({ status: error.status, code: error.code, message: error.message });
            } else {
                logger.error('failed to send message');
            }
        }
    }

    public async sendEmbedMessage(chatId: string, message: string, embedMessage: any, config: DiscordConfig) {
        this.checkInit();

        try {
            let receiver: User | TextChannel | ThreadChannel | undefined = await this.getReceiver(chatId, config);

            // Build embed
            let embed = new EmbedBuilder(embedMessage);

            // Send embed
            await receiver!.send({ content: message, tts: config.tts, embeds: [embed] });
        } catch (error: any | DiscordAPIError) {
            if (error instanceof DiscordAPIError) {
                logger.error({ status: error.status, code: error.code, message: error.message });
            } else {
                logger.error('failed to send embed message');
            }
        }
    }
}