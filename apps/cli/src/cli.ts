import { parseArgs } from "node:util";
import { exit, argv } from "node:process";
import { GLOBAL_CONFIG_FILE } from "./constants";
import { ensureFileInPath } from "./fs-utils";
import { link } from "./commands/link";
import { sync } from "./commands/sync";
import { showHelp, CLI_ARGS_OPTIONS } from "./args";
import type { SupportedCommands } from "./args";
import packageJSON from "../package.json" assert { type: "json" };

const commands: SupportedCommands = {
  link,
  sync,
};

export const main = async () => {
  try {
    await ensureFileInPath(GLOBAL_CONFIG_FILE, "{}");

    const args = parseArgs({
      args: argv.slice(2),
      options: CLI_ARGS_OPTIONS,
      allowPositionals: true,
    });

    if (args.values?.version) {
      console.info(packageJSON.version);
      exit(0);
    }

    if (args.values?.help) {
      showHelp();
      exit(0);
    }

    const commandId = argv[2];
    const command = commands[commandId];
    if (command === undefined) {
      throw new Error(`No command provided`);
    }

    await command({ ...args, positionals: args.positionals.slice(1) });
    exit(0);
  } catch (error) {
    console.error(error);
    showHelp();
    exit(1);
  }
};
