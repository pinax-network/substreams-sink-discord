#!/usr/bin/env node

import { cli } from "substreams-sink";
import { cli as cliSocial } from "substreams-sink-socials";

import { action, DEFAULT_DISCORD_API_TOKEN_ENV } from "../index.js"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);

cliSocial.addSocialConfigOption(command);

command.option('--discord-api-token <string>', 'API token for the Discord bot')
command.option('--discord-api-token-envvar <string>', 'Environnement variable name of the API token for the Discord bot', DEFAULT_DISCORD_API_TOKEN_ENV)

command.action(action);
program.parse();

cliSocial.validateSocialConfigOption(command);
