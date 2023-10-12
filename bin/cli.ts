#!/usr/bin/env node

import { commander } from "substreams-sink";
import { Option } from "commander";
import { commander as commanderSocial } from "substreams-sink-socials";

import { action } from "../index.js"
import pkg from "../package.json" assert { type: "json" };

const program = commander.program(pkg);
const command = commander.run(program, pkg);

commanderSocial.addSocialConfigOption(command);
commanderSocial.validateSocialConfigOption(command);

command.addOption(new Option("--discord-api-token <string>", "API token for the Discord bot").makeOptionMandatory().env("DISCORD_API_TOKEN"))

command.action(action);
program.parse();
