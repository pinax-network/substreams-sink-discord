import { logger } from "substreams-sink";
import { Client, TextChannel, User } from "discord.js";

import { timeout } from "./utils";

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
            // ...
            // Or fetch
            await (await this.client.channels.fetch(channelId) as TextChannel).send(message);
            // await (await this.client.users.fetch(userId)).send(message);
        } catch (error: any) {
            // Need to handle discord errors
            if (error.code === '') {
                switch (error.response.statusCode) {
                    default:
                        break;
                }
            } else {
                logger.error('failed to send message');
            }
        }
    }
}