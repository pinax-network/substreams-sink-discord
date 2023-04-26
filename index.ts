import { EntityChanges, download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import fs from "fs";
import YAML from "yaml";
import path from "path";
import PQueue from "p-queue";
import { ZodError } from "zod";

import { ChatType, Discord, DiscordConfig, DiscordConfigsSchema } from "./src/discord";

import pkg from "./package.json";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default discord options
export const DEFAULT_DISCORD_API_TOKEN_ENV = 'DISCORD_API_TOKEN';

// Custom user options interface
interface ActionOptions extends RunOptions {
    config: string,
    discordApiTokenEnvvar: string,
    discordApiToken: string,
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { config, discordApiTokenEnvvar, discordApiToken } = options;

    // Read config file
    let configs: any[];
    const ext: string = path.extname(config);
    const rawConfigs = fs.readFileSync(config, 'utf-8');

    try {
        if (ext === '.json') {
            configs = DiscordConfigsSchema.parse(JSON.parse(rawConfigs));
        } else if (ext === '.yml' || ext === '.yaml') {
            configs = DiscordConfigsSchema.parse(YAML.parse(rawConfigs));
        }
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error(JSON.stringify(error));
        } else {
            logger.error(error);
        }
        process.exit(1);
    }

    // Discord options
    const discord_api_token = discordApiToken ?? process.env[discordApiTokenEnvvar];

    if (!discord_api_token) {
        logger.error('[discord_api_token] is required');
        process.exit(1);
    }

    // Initialize Discord bot
    const discordBot = new Discord();
    await discordBot.init(discord_api_token);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    const queue = new PQueue({ concurrency: 1, intervalCap: 1, interval: 1000 });

    substreams.on("anyMessage", async (message: EntityChanges) => {

        message.entityChanges.forEach(async (entityChange) => {

            configs.forEach(async (conf: DiscordConfig) => {

                if (entityChange.entity === conf.entity) {

                    let formattedMessage: string = conf.message;

                    entityChange.fields.forEach(async (field) => {
                        formattedMessage = formattedMessage.replaceAll(`{${field.name}}`, field.newValue?.typed.value as string); // TODO make a null check
                    });

                    if (conf.user_ids) {
                        conf.user_ids.forEach(async (userId: string) => {
                            await queue.add(() => discordBot.sendMessage(userId, formattedMessage, ChatType.USER));
                        });
                    }

                    if (conf.channel_ids) {
                        conf.channel_ids.forEach(async (channelId: string) => {
                            await queue.add(() => discordBot.sendMessage(channelId, formattedMessage, ChatType.CHANNEL));
                        });
                    }
                }
            });
        });
    });

    substreams.start(options.delayBeforeStart);
}
