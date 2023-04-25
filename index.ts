import { EntityChanges, download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import fs from "fs";
import YAML from 'yaml'
import path from "path";
import PQueue from 'p-queue';

import { Discord, DiscordConfig } from "./src/discord";

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

    if (ext === '.json') {
        configs = JSON.parse(rawConfigs);
    } else if (ext === '.yml' || ext === '.yaml') {
        configs = YAML.parse(rawConfigs);
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

                    conf.chat_ids.forEach(async (chatId: string) => {
                        await queue.add(() => discordBot.sendMessage(chatId, formattedMessage));
                    });
                }
            });
        });
    });

    substreams.start(options.delayBeforeStart);
}
