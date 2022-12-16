import { useState } from "react";
import {
  keyframes,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  styled,
} from "@webstudio-is/design-system";
import {
  CssValueInput,
  type IntermediateStyleValue,
} from "../../shared/css-value-input";
import type { StyleProperty, StyleValue } from "@webstudio-is/css-data";
import type { StyleChangeEvent } from "./types";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "scale(0)" },
  "100%": { opacity: 1, transform: "scale(1)" },
});

const Input = ({
  value,
  property,
  onChange,
}: {
  property: StyleProperty;
  value: StyleValue;
  onChange: (event: StyleChangeEvent) => void;
}) => {
  const [currentValue, setCurrentValue] = useState<
    StyleValue | IntermediateStyleValue
  >();
  return (
    <CssValueInput
      property={property}
      value={currentValue ?? value}
      onChange={(styleValue) => {
        setCurrentValue(styleValue);
        if (styleValue.type !== "intermediate") {
          onChange({ property, value: styleValue, isEphemeral: true });
        }
      }}
      onPreview={(styleValue) => {
        onChange({ property, value: styleValue, isEphemeral: true });
      }}
      onChangeComplete={(styleValue) => {
        setCurrentValue(undefined);
        onChange({ property, value: styleValue, isEphemeral: false });
      }}
    />
  );
};

// Trigger is used only for positioning
const Trigger = styled("div", { position: "absolute", width: 0, height: 0 });

export const InputPopover = ({
  value,
  property,
  onChange,
  isOpen,
  onClose,
}: {
  property: StyleProperty;
  value: StyleValue;
  onChange: (event: StyleChangeEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen === false) {
          onClose();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Trigger />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          hideArrow
          css={{
            background: "none",
            boxShadow: "none",
            borderRadius: 0,
            minWidth: 80,
            width: 80,
            padding: 2,
            animationDuration: "200ms",
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            '&[data-state="open"]': { animationName: slideUpAndFade },
          }}
          sideOffset={-20}
        >
          <Input value={value} property={property} onChange={onChange} />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};
