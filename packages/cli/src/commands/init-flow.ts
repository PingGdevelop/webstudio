import { ensureFolderExists, isFileExists } from "../fs-utils";
import { chdir, cwd } from "node:process";
import { join } from "node:path";
import ora from "ora";
import { link } from "./link";
import { sync } from "./sync";
import { build, buildOptions } from "./build";
import { prompt } from "../prompts";
import type { StrictYargsOptionsToInterface } from "./yargs-types";
import pc from "picocolors";
import { $ } from "execa";

export const initFlow = async (
  options: StrictYargsOptionsToInterface<typeof buildOptions>
) => {
  const isProjectConfigured = await isFileExists(".webstudio/config.json");
  let shouldInstallDeps = false;
  let folderName;

  if (isProjectConfigured === false) {
    const { shouldCreateFolder } = await prompt({
      type: "confirm",
      name: "shouldCreateFolder",
      message:
        "Would you like to create a project folder? (no to use current folder)",
      initial: true,
    });

    if (shouldCreateFolder === true) {
      folderName = (
        await prompt({
          type: "text",
          name: "folderName",
          message: "Please enter a project name",
        })
      ).folderName;

      if (folderName === undefined) {
        throw new Error("Folder name is required");
      }
      await ensureFolderExists(join(cwd(), folderName));
      chdir(join(cwd(), folderName));
    }

    const { projectLink } = await prompt({
      type: "text",
      name: "projectLink",
      message: "Please paste a link from the Share dialog in the builder",
    });

    if (projectLink === undefined) {
      throw new Error(`Project Link is required`);
    }
    await link({ link: projectLink });

    const { installDeps } = await prompt({
      type: "confirm",
      name: "installDeps",
      message: "Would you like to install dependencies? (recommended)",
      initial: true,
    });
    shouldInstallDeps = installDeps;
  }

  await sync({ buildId: undefined, origin: undefined });
  await build(options);

  if (shouldInstallDeps === true) {
    const spinner = ora().start();
    spinner.text = "Installing dependencies";
    await $`npm install`;
    spinner.succeed("Installed dependencies");
  }

  console.info(pc.bold(pc.green(`\nYour project was successfully synced 🎉`)));
  console.info(
    [
      "Now you can:",
      folderName && `Go to your project: ${pc.dim(`cd ${folderName}`)}`,
      `Run ${pc.dim("npm run dev")} to preview your site on a local server.`,
      `Run ${pc.dim("npx vercel")} to publish on Vercel.`,
    ]
      .filter(Boolean)
      .join("\n")
  );
};
