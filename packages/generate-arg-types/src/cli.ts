#!/usr/bin/env tsx
/* eslint-disable no-console */

import * as path from "node:path";
import { withCustomConfig } from "react-docgen-typescript";
import fg from "fast-glob";
import fs from "fs-extra";
import { propsToArgTypes } from "./arg-types";

const GENERATED_FILES_DIR = "__generated__";

const options = {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
};

const componentsGlobString = process.argv.slice(2).pop();
const tsConfigPath = path.resolve(process.cwd(), "./tsconfig.json");

if (typeof componentsGlobString === "undefined") {
  throw new Error(
    "Please provide glob patterns (space separated) as arguments to match your components"
  );
}

// Search for components
const globs = componentsGlobString.split(" ");
const componentFiles = fg.sync(globs);

console.log(`Resolved tscofig.json at ${tsConfigPath}\n`);
console.log(`Glob patterns used: \n${globs.join("\n")}\n`);
console.log(`Found files to process: \n${componentFiles.join("\n")}\n`);

if (componentFiles.length === 0) {
  throw new Error("No component files found");
}

// Create a parser with using your typescript config
const tsConfigParser = withCustomConfig(tsConfigPath, options);

// For each component file generate argTypes based on the propTypes
for (const filePath of componentFiles) {
  const generatedDir = path.join(path.dirname(filePath), GENERATED_FILES_DIR);

  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const generatedFile = `${path.basename(filePath, ".tsx")}.props.ts`;
  const generatedPath = path.join(generatedDir, generatedFile);

  const componentDocs = tsConfigParser.parse(filePath);

  if (componentDocs.length === 0) {
    console.error(`No propTypes found for ${filePath}`);
    continue;
  }

  fs.ensureFileSync(generatedPath);

  let fileContent = `import type { PropMeta } from "@webstudio-is/generate-arg-types";\n`;

  if (componentDocs.length === 1) {
    const argTypes = propsToArgTypes(componentDocs[0].props);

    fileContent = `${fileContent}
      export const props: Record<string, PropMeta> = ${JSON.stringify(
        argTypes
      )}`;
  } else {
    for (const componentDoc of componentDocs) {
      const componentName = componentDoc.displayName;

      const argTypes = propsToArgTypes(componentDoc.props);

      fileContent = `${fileContent}
        export const props${componentName}: Record<string, PropMeta> = ${JSON.stringify(
        argTypes
      )}`;
    }
  }

  fs.writeFileSync(generatedPath, fileContent);

  console.log(`Done generating argTypes for ${generatedPath}`);
}
