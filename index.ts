import { download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import PQueue from 'p-queue';

import { Discord } from "./src/discord";

import pkg from "./package.json";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default discord options
export const DEFAULT_DISCORD_API_TOKEN_ENV = 'DISCORD_API_TOKEN';

// Custom user options interface
interface ActionOptions extends RunOptions {
    channelId: string,
    discordApiTokenEnvvar: string,
    discordApiToken: string,
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { channelId, discordApiTokenEnvvar, discordApiToken } = options;

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

    substreams.on("anyMessage", async (message: any) => {

        await queue.add(() => discordBot.sendMessage(channelId, JSON.stringify(message)));
    });

    substreams.start(options.delayBeforeStart);
}
