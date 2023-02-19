import store from "immerhin";
import { gfm } from "micromark-extension-gfm";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Instance, Prop } from "@webstudio-is/project-build";
import type { Root } from "mdast-util-from-markdown/lib";
import { utils } from "@webstudio-is/project";
import { nanoid } from "nanoid";
import {
  createInstancesIndex,
  findClosestDroppableTarget,
  insertInstanceMutable,
} from "../tree-utils";
import {
  instancesIndexStore,
  propsStore,
  rootInstanceContainer,
  selectedInstanceIdStore,
} from "../nano-states";

const micromarkOptions = { extensions: [gfm()] };

export const mimeType = "text/plain";

const astTypeComponentMap: Record<string, Instance["component"]> = {
  paragraph: "Paragraph",
  heading: "Heading",
  strong: "Bold",
  emphasis: "Italic",
};

type Options = { generateId?: typeof nanoid };

const toInstancesData = (
  ast: { children: Root["children"] },
  options: Options = {}
): { instances: Instance["children"]; props: Array<Prop> } => {
  const { generateId = nanoid } = options;
  const instances: Instance["children"] = [];
  const props: Array<Prop> = [];

  for (const child of ast.children) {
    const component = astTypeComponentMap[child.type];
    if (component) {
      const instance = utils.tree.createInstance({
        id: generateId(),
        component,
        children:
          "children" in child ? toInstancesData(child, options).instances : [],
      });
      instances.push(instance);
      if (component === "Heading" && "depth" in child) {
        props.push({
          id: generateId(),
          type: "string",
          name: "tag",
          instanceId: instance.id,
          value: `h${child.depth}`,
        });
      }
    }

    if (child.type === "text") {
      instances.push({
        type: "text",
        value: child.value,
      });
    }
  }
  return { instances, props };
};

export const parse = (clipboardData: string, options?: Options) => {
  const ast = fromMarkdown(clipboardData, micromarkOptions);
  if (ast.children.length === 0) {
    return;
  }
  return toInstancesData(ast, options);
};

export const onPaste = (clipboardData: string) => {
  const data = parse(clipboardData);
  if (data === undefined) {
    return;
  }

  const dropTarget = findClosestDroppableTarget(
    instancesIndexStore.get(),
    selectedInstanceIdStore.get()
  );
  store.createTransaction(
    [rootInstanceContainer, propsStore],
    (rootInstance, props) => {
      const instancesIndex = createInstancesIndex(rootInstance);
      for (const instance of data.instances) {
        insertInstanceMutable(instancesIndex, instance, dropTarget);
      }
      for (const prop of data.props) {
        props.set(prop.id, prop);
      }
    }
  );
};
