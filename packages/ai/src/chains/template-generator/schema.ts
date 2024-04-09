import { z } from "zod";
import { WsEmbedTemplate } from "@webstudio-is/react-sdk";

/**
 * Template Generator Chain.
 *
 * Given a UI section or widget description, this chain generates a Webstudio Embed Template representing the UI.
 */

export const name = "template-generator";

export const ContextSchema = z.object({
  // The prompt provides the original user request.
  prompt: z.string(),
  components: z.array(z.string()),
});
export type Context = z.infer<typeof ContextSchema>;

export const ResponseSchema = WsEmbedTemplate;
export type Response = z.infer<typeof ResponseSchema>;
