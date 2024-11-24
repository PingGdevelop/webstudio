import type {
  AnyComponent,
  WebstudioComponentSystemProps,
} from "@webstudio-is/react-sdk";
import * as React from "react";

export const EditableBlock = React.forwardRef<
  HTMLDivElement,
  WebstudioComponentSystemProps
>((props, ref) => {
  return <div ref={ref} {...props} />;
}) as AnyComponent;