#!/usr/bin/env node

import { cli, logger } from "substreams-sink";
import fs from "fs";
import path from "path";

import { action, DEFAULT_DISCORD_API_TOKEN_ENV } from "../index.js"
import pkg from "../package.json";

const SUPPORTED_CONFIG_FORMAT = ['.json', '.yaml', '.yml'];

const program = cli.program(pkg);
const command = cli.run(program, pkg);

command.requiredOption('-c --config <string>', `Config file path (supported: ${SUPPORTED_CONFIG_FORMAT.map(e => `"${e}"`).join(', ')})`)
command.option('--discord-api-token <string>', 'API token for the Discord bot')
command.option('--discord-api-token-envvar <string>', 'Environnement variable name of the API token for the Discord bot', DEFAULT_DISCORD_API_TOKEN_ENV)

command.action(action);
program.parse();

const options = command.opts();
if (options.config) {
    if (fs.existsSync(options.config)) {
        const ext: string = path.extname(options.config);
        if (!SUPPORTED_CONFIG_FORMAT.includes(ext)) {
            logger.error(`config file with extension '${ext}' not supported. (supported: ${SUPPORTED_CONFIG_FORMAT.map(e => `"${e}"`).join(', ')})`);
            process.exit(1);
        }
    } else {
        logger.error(`file '${options.config}' does not exist`);
        process.exit(1);
    }
}