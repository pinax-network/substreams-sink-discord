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
        messages.entityChanges.forEach(async (entityChange) => {
            social.configs.forEach(async (conf: any) => {
                if (entityChange.entity === conf.entity) {
                    const formattedMessage = social.formatMessage(entityChange, conf.message);
                    let formattedEmbed: any;

                    if (conf.embed) {
                        formattedEmbed = JSON.stringify(conf.embed);

                        entityChange.fields.forEach(async (field) => {
                            formattedEmbed = String(formattedEmbed).replaceAll(`{${field.name}}`, field.newValue?.typed.case === "array" ? field.newValue!.typed.value.value.map(v => (v.typed.value)).join() : field.newValue?.typed.value as string);
                        });

                        formattedEmbed = JSON.parse(formattedEmbed);
                    }

                    conf.chat_ids.forEach(async (chatId: string) => {
                        if (conf.embed) {
                            await social.queue.add(() => discordBot.sendEmbedMessage(chatId, formattedMessage, formattedEmbed, conf));
                        } else {
                            await social.queue.add(() => discordBot.sendTextMessage(chatId, formattedMessage, conf));
                        }

                    });
                }
            });
        });
    });

    substreams.start(options.delayBeforeStart);
}
