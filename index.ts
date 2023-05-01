import { EntityChanges, download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import { Social } from "substreams-sink-socials";

import { Discord, DiscordConfigSchema } from "./src/discord";

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

    // Social setup
    let social: Social = new Social(config, DiscordConfigSchema);

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

    substreams.on("anyMessage", async (messages: EntityChanges) => {
        await social.distributeMessages(messages, (chatId, message, config) => {
            discordBot.sendMessage(chatId, message, config);
        });
    });

    substreams.start(options.delayBeforeStart);
}
