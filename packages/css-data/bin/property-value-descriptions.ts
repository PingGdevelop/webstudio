/* eslint-disable no-console, func-style */
import * as fs from "node:fs";
import * as path from "node:path";
import type { CreateChatCompletionResponse } from "openai";
import { fetch } from "undici";
import { keywordValues } from "../src/__generated__/keyword-values";

/**
 * Using ChatGPT, this scripts generates descriptions for CSS properties and declarations (property-value).
 * It uses `keywordValues` to get a list of all the properties and values.
 *
 * The result is a TS module located at ./src/__generated__/property-value-descriptions.ts which exports:
 * - properties
 * - declarations
 *
 * By default it generates descriptions only for new properties/values, however you can use the --force flag to regenerate everything.
 *
 * The script needs two env variables:
 * - process.env.OPENAI_KEY - Your OpenAI API key https://platform.openai.com/account/api-keys
 * - process.env.OPENAI_ORG - Your OpenAI Org ID https://platform.openai.com/account/org-settings
 */

const args = process.argv.slice(2);
let forceRegenerate = false;
if (args.includes("--force")) {
  forceRegenerate = true;
  args.splice(args.indexOf("--force"), 1);
}

const fileName = "property-value-descriptions.ts";
const targetPath = path.join(process.cwd(), "src", "__generated__");

let propertiesGenerated: Record<string, string> = {};
let propertiesOverrides: Record<string, string> = {};
let declarationsGenerated: Record<string, string> = {};
let declarationsOverrides: Record<string, string> = {};

try {
  ({
    propertiesGenerated = {},
    propertiesOverrides = {},
    declarationsGenerated = {},
    declarationsOverrides = {},
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Fix this else it'll complain that we cannot use top-level await.
  } = await import(path.join(targetPath, fileName)));
} catch (error) {}

const batchSize = 16;

/**
 * Properties descriptions
 */
const newPropertiesNames = Object.keys(keywordValues)
  // Slice to generate only X - useful for testing.
  // .slice(0, 30)
  .filter(
    (property) =>
      forceRegenerate ||
      (typeof propertiesGenerated[property] !== "string" &&
        typeof propertiesOverrides[property] !== "string")
  );

for (let i = 0; i < newPropertiesNames.length; ) {
  const properties = newPropertiesNames.slice(i, i + batchSize);

  console.log(
    `[${Math.floor(i / batchSize) + 1}/${Math.ceil(
      newPropertiesNames.length / batchSize
    )}] Generating properties descriptions.`
  );

  if (properties.length === 0) {
    i += batchSize;
    continue;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Fix this else it'll complain that we cannot use top-level await.

  const result = await generate(
    `
I created a no-code app for building websites. People who don't know HTML and CSS can use it to create sites easily. My app has a styles panel where the can tweak CSS properties for the selected element. Every control consists of a label and an input field. The label is the CSS property name. When the user hover over the property name we show a tooltip with information about the property.

The fundamental purpose of tooltip information is to teach users how to use a part of the UI to accomplish their intentions, therefore explanations should be descriptive and educative. Here is an example of a good explanation and a bad one:

- Good: "Controls the visual appearance of checkboxes, radio buttons, and other form controls."
- Bad: "Controls the white space of an element". That's frustratingly useless because it just repeats the property name (white-space) without adding any teaching information.

I will now give you a list of CSS properties and I want you to generate a matching list of explanations that are no longer than 200 characters and teach the user what is the property about! I looked at  https://css-tricks.com/almanac/properties/ and their explanations seem very good!

Here is the list of CSS properties:

\`\`\`
${properties.map((name) => `- ${name}`).join("\n")}
\`\`\`

Respond with a matching list of explanations as a markdown code block.
Very important: don't repeat the property name at the beginning of the explanation!

The response should start with \`\`\`markdown
`.trim()
  );

  if (Array.isArray(result)) {
    // Retry
    if (result[0] === 429) {
      console.log(`❌  Error: 429 ${result[1]}. Retrying...`);
      continue;
    }

    throw new Error(`❌ Error: ${result[0]} ${result[1]}`);
  }

  const descriptions = grabDescriptions(result);

  if (properties.length !== descriptions.length) {
    console.log(
      "❌ Error: the number of generated descriptions does not match the amount of inputs. Retrying..."
    );

    console.log({ input: properties.join("\n"), output: result });
    continue;
  }

  properties.forEach((name, index) => {
    propertiesGenerated[name] = descriptions[index]
      .replace(new RegExp(`^\`?${name}\`?:`), "")
      .trim();
  });

  writeFile({
    propertiesGenerated,
    propertiesOverrides,
    properties: `{ ...propertiesGenerated, ...propertiesOverrides }`,
    declarationsGenerated,
    declarationsOverrides,
    declarations: `{ ...declarationsGenerated, ...declarationsOverrides }`,
  });

  i += batchSize;
}
console.log("\n✅ Properties description generated!\n");

/**
 * Declarations descriptions
 */
const newDeclarationsDescriptions: Record<string, string> = {};
const propertyColors: Record<string, string[]> = {};

Object.entries(keywordValues)
  // Slice to generate only X - useful for testing.
  // .slice(0, 10)
  .forEach(([keyword, values]) => {
    return values.forEach((value, index) => {
      const descriptionKey = `${keyword}:${value}`;
      if (
        !forceRegenerate &&
        (typeof declarationsGenerated[descriptionKey] === "string" ||
          typeof declarationsOverrides[descriptionKey] === "string")
      ) {
        return;
      }

      const property = toKebabCase(keyword);

      const excludedProperties = ["boxShadow"];
      // We are currently skipping generation for color-related properies. Uncomment the code below to enable colors generation.
      // Also add the following line to the GPT prompt:
      // "When you encounter a declaration where the value is \`{color}\` make the description generic: this is a template that I will later use for all my colors."
      //
      // const nonColorValues = [
      //   "auto",
      //   "initial",
      //   "inherit",
      //   "unset",
      //   "currentColor",
      //   "transparent",
      //   "none"
      // ];
      if (excludedProperties.includes(keyword)) {
        return;
      } else if (
        keyword.toLowerCase().includes("color")
        // && !nonColorValues.includes(value)
      ) {
        return;
        /*
          When it comes to generating descriptions for declarations whose value is a color eg. `background-color: orange`
          we generate a description for a generic `property: {color_value}` declaration (e.g. `background-color: {color}`)
          and GPT will generate a description template with a placeholder `{color_value}`.
          The script repeats the template for every color value, replacing `{color_value}`.
          This is to avoid generating a ton of similar description and wasting GPT tokens.
         */
        // descriptionKey = `${keyword}:{color}`;
        // if (!propertyColors[descriptionKey]) {
        //   propertyColors[descriptionKey] = [];
        // }
        // propertyColors[descriptionKey].push(value);
        // newDeclarationsDescriptions[descriptionKey] = `${property}: {color}`;
      } else {
        newDeclarationsDescriptions[descriptionKey] = `${property}: ${value}`;
      }
    });
  });

const newDeclarationsDescriptionsEntries = Object.entries(
  newDeclarationsDescriptions
);

for (let i = 0; i < newDeclarationsDescriptionsEntries.length; ) {
  const batch = newDeclarationsDescriptionsEntries.slice(i, i + batchSize);

  const list = batch.map(([descriptionKey, declaration]) => `- ${declaration}`);

  console.log(
    `[${Math.floor(i / batchSize) + 1}/${Math.ceil(
      newDeclarationsDescriptionsEntries.length / batchSize
    )}] Generating declarations descriptions.`
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Fix this else it'll complain that we cannot use top-level await.
  const result = await generate(
    `
I created a no-code app for building websites. People who don't know HTML and CSS can use it to create sites easily. My app has a styles panel where the can tweak CSS properties and values for the selected element. Every control consists of a label and an input field. The label is the CSS property name whereas the input contains the property value. When the user hover over the property name we show a tooltip with information about the declaration (property and its value).

The fundamental purpose of tooltip information is to teach users how to use a part of the UI to accomplish their intentions, therefore explanations should be descriptive and educative. Here is an example of a bad explanation and a good one:

- Bad explanation for \`align-content: normal\`: "Aligns content as usual.".
- Good explanation for \`align-content: normal\`: "- The items are packed in their default position as if no align-content value was set."

I will now give you a list of CSS declarations and I want you to generate a matching list of explanations that are no longer than 200 characters and teach the user what is the declaration about! Include a description of what both the property and its value do.

Here is the list of CSS declarations:

\`\`\`
${list.join("\n")}
\`\`\`

Respond with a matching list of explanations as a markdown code block.
Don't repeat the declaration at the beginning of the explanation:

Wrong:
\`- \\\`align-content: normal\\\` - Aligns content as usual.\`

Correct:
\`- The items are packed in their default position as if no align-content value was set.\`

The response should start with \`\`\`markdown
`.trim()
  );

  if (Array.isArray(result)) {
    // Retry
    if (result[0] === 429) {
      console.log(`❌  Error: 429 ${result[1]}. Retrying...`);
      continue;
    }

    throw new Error(`❌ Error: ${result[0]} ${result[1]}`);
  }

  const descriptions = grabDescriptions(result);

  if (list.length !== descriptions.length) {
    console.log(
      "❌ Error: the number of generated descriptions does not match the amount of inputs. Retrying..."
    );

    console.log({ input: list.join("\n"), output: result });
    continue;
  }

  batch.forEach((value, index) => {
    const [descriptionKey, decl] = value;
    const description = descriptions[index]
      .replace(new RegExp(`^\`${decl}\` -`), "")
      .trim();
    if (descriptionKey.endsWith(":{color}")) {
      const colors = propertyColors[descriptionKey];
      if (colors) {
        colors.forEach((color) => {
          declarationsGenerated[descriptionKey.replace("{color}", color)] =
            description.replace("{color}", color);
        });
      } else {
        console.log(
          `❌ Error: Expanding the colors for ${descriptionKey} failed because we couldn't find it in propertyColors. Skipping...`
        );
      }
    } else {
      declarationsGenerated[descriptionKey] = description;
    }
  });

  writeFile({
    propertiesGenerated,
    propertiesOverrides,
    properties: `{ ...propertiesGenerated, ...propertiesOverrides }`,
    declarationsGenerated,
    declarationsOverrides,
    declarations: `{ ...declarationsGenerated, ...declarationsOverrides }`,
  });

  i += batchSize;
}

console.log("\n✅ Declarations description generated!\n");
console.log("✨ Done.");

function writeFile(descriptions: Record<string, any>) {
  const autogeneratedHint = "// This file was auto-generated\n";

  const content =
    autogeneratedHint +
    Object.entries(descriptions)
      .map(
        ([binding, value]) =>
          `export const ${binding} = ` +
          (typeof value === "string" ? value : JSON.stringify(value, null, 2)) +
          " as const;"
      )
      .join("\n\n");

  fs.writeFileSync(path.join(targetPath, fileName), content, "utf-8");
}

async function generate(message: string): Promise<string | [number, string]> {
  if (!process.env.OPENAI_KEY) {
    throw new Error("Missing OpenAI key (process.env.OPENAI_KEY)");
  }

  if (
    typeof process.env.OPENAI_ORG !== "string" ||
    !process.env.OPENAI_ORG.startsWith("org-")
  ) {
    throw new Error(
      "Missing OpenAI org (process.env.OPENAI_ORG) or invalid org"
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      "OpenAI-Organization": process.env.OPENAI_ORG,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      temperature: 1,
    }),
  });

  if (response.ok === false) {
    return [response.status, response.statusText];
  }

  const completion = (await response.json()) as CreateChatCompletionResponse;

  const content = completion.choices[0].message?.content.trim() || "";

  if (content === "") {
    return [404, "No response"];
  }

  return content;
}

function grabDescriptions(message: string) {
  const descriptions: string[] = [];
  message.split("\n").forEach((line) => {
    if (line.startsWith("-")) {
      descriptions.push(line.replace(/^-\s*/, ""));
    }
  });
  return descriptions;
}

function toKebabCase(keyword: string) {
  const label = keyword
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return label;
}
