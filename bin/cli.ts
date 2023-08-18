#!/usr/bin/env node

import { commander } from "substreams-sink";
import { commander as commanderSocial } from "substreams-sink-socials";

import { action, DEFAULT_DISCORD_API_TOKEN_ENV } from "../index.js"
import pkg from "../package.json" assert { type: "json" };

const program = commander.program(pkg);
const command = commander.run(program, pkg);

commanderSocial.addSocialConfigOption(command);

command.option('--discord-api-token <string>', 'API token for the Discord bot')
command.option('--discord-api-token-envvar <string>', 'Environnement variable name of the API token for the Discord bot', DEFAULT_DISCORD_API_TOKEN_ENV)

command.action(action);
program.parse();

commanderSocial.validateSocialConfigOption(command);
