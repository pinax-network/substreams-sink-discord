import { logger } from "substreams-sink";
import { Client, TextChannel, User, ThreadChannel, DiscordAPIError } from "discord.js";
import { z } from "zod";

export enum ChatType {
    USER,
    CHANNEL,
}

const DiscordConfigSchema = z.object({
    entity: z.string(),
    user_ids: z.array(z.string()),
    channel_ids: z.array(z.string()),
    message: z.string()
}).partial({
    user_ids: true,
    channel_ids: true,
}).refine(
    config => config.user_ids || config.channel_ids,
    "must provide 'user_ids' or 'channel_ids'",
);

export const DiscordConfigsSchema = z.array(DiscordConfigSchema);
export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;

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

    public async sendMessage(chatId: string, message: string, chatType: ChatType) {
        try {
            switch (chatType) {
                case ChatType.USER:
                    // Check in cache
                    let user: User = this.client.users.cache.get(chatId) as User;

                    // Or fetch
                    if (!user)
                        user = await this.client.users.fetch(chatId) as User;

                    await user.send(message);
                    break;
                case ChatType.CHANNEL:
                    // Check in cache
                    let channel: TextChannel | ThreadChannel = this.client.channels.cache.get(chatId) as TextChannel | ThreadChannel;

                    // Or fetch
                    if (!channel)
                        channel = await this.client.channels.fetch(chatId) as TextChannel | ThreadChannel;

                    await channel.send(message);
                    break;
                default:
                    break;
            }

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