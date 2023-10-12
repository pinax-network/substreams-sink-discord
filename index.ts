import { setup, logger, commander } from "substreams-sink";
import { Social } from "substreams-sink-socials";

import { Discord, DiscordConfigSchema } from "./src/discord.js";

// Custom user options interface
interface ActionOptions extends commander.RunOptions {
    config: string,
    discordApiToken: string,
}

export async function action(options: ActionOptions) {
    const { emitter, substreamPackage, startCursor, moduleHash } = await setup(options);

    // Get command options
    const { config, discordApiToken } = options;

    // Social setup
    let social: Social = new Social(config, DiscordConfigSchema);

    // Initialize Discord bot
    const discordBot = new Discord();
    await discordBot.init(discordApiToken);

    emitter.on("anyMessage", (messages) => {
        if (messages.entityChanges) {
            console.log(messages);
            for (const entityChange of messages.entityChanges as any) {
                social.configs.forEach(async (conf: any) => {
                    if (entityChange.entity === conf.entity) {
                        const formattedMessage = social.formatMessage(entityChange, conf.message);
                        let formattedEmbed: any;

                        if (conf.embed) {
                            formattedEmbed = JSON.stringify(conf.embed);

                            entityChange.fields.forEach(async (field: any) => {
                                formattedEmbed = String(formattedEmbed).replaceAll(`{${field.name}}`, field.newValue?.array ? field.newValue!.array.map((v: any) => (v)).join() : (field.newValue?.string as string || field.newValue?.bool as boolean || field.newValue?.bigint as number || field.newValue?.int32 as number)); // TODO make it cleaner
                            });

                            formattedEmbed = JSON.parse(formattedEmbed);
                        }

                        conf.chat_ids.forEach(async (chatId: string) => {
                            if (options.verbose) {
                                logger.info({ chatId, formattedMessage });
                            }

                            if (conf.embed) {
                                await social.queue.add(() => discordBot.sendEmbedMessage(chatId, formattedMessage, formattedEmbed, conf));
                            } else {
                                await social.queue.add(() => discordBot.sendTextMessage(chatId, formattedMessage, conf));
                            }
                        });
                    }
                });
            }
        }
    });

    await emitter.start();
}
