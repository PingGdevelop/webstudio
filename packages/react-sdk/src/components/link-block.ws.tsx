import { BoxLinkIcon } from "@webstudio-is/icons";
import type { WsComponentMeta, WsComponentPropsMeta } from "./component-meta";
import { props } from "./__generated__/link-block.props";
import { propsMeta as linkPropsMeta } from "./link.ws";

const presetStyle = {
  boxSizing: {
    type: "keyword",
    value: "border-box",
  },
  display: {
    type: "keyword",
    value: "inline-block",
  },
} as const;

export const meta: WsComponentMeta = {
  category: "general",
  type: "container",
  label: "Link Block",
  Icon: BoxLinkIcon,
  presetStyle,
};

export const propsMeta: WsComponentPropsMeta = {
  props: {
    ...props,
    href: linkPropsMeta.props.href,
  },
  initialProps: linkPropsMeta.initialProps,
};
