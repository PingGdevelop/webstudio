import React from "react";
import { CrossLargeIcon } from "@webstudio-is/icons";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Box } from "./box";
import { panelStyles } from "./panel";
import { Flex } from "./flex";
import { DeprecatedIconButton } from "./__DEPRECATED__/icon-button";
import { Text } from "./text";
import { Separator } from "./separator";
import { styled, CSS } from "../stitches.config";
import { theme } from "../stitches.config";

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root> & {
  children: React.ReactNode;
};

export const Popover = ({ children, ...props }: PopoverProps) => {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>;
};

const StyledContent = styled(PopoverPrimitive.Content, panelStyles, {
  backgroundColor: "white",
  minWidth: 200,
  minHeight: theme.spacing[13],
  maxWidth: "max-content",
  "&:focus": {
    outline: "none",
  },
  display: "flex",
  flexDirection: "column",
});

type PopoverContentPrimitiveProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
>;

type PopoverContentProps = PopoverContentPrimitiveProps & {
  css?: CSS;
  hideArrow?: boolean;
};

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof StyledContent>,
  PopoverContentProps
>(({ children, hideArrow, ...props }, fowardedRef) => (
  <StyledContent
    sideOffset={4}
    collisionPadding={4}
    {...props}
    ref={fowardedRef}
  >
    {children}
    {!hideArrow && (
      <Box css={{ color: theme.colors.panel }}>
        <PopoverPrimitive.Arrow
          width={11}
          height={5}
          offset={5}
          style={{ fill: "currentColor" }}
        />
      </Box>
    )}
  </StyledContent>
));
PopoverContent.displayName = "PopoverContent";

type PopoverHeaderProps = {
  title: string;
};

export const PopoverHeader = ({ title }: PopoverHeaderProps) => {
  return (
    <Box css={{ order: -1 }}>
      <Flex
        css={{ height: 40, paddingLeft: theme.spacing[9] }}
        align="center"
        justify="between"
      >
        <Text variant="title">{title}</Text>
        <PopoverClose asChild>
          <DeprecatedIconButton
            size="2"
            css={{
              marginRight: theme.spacing[5],
            }}
            aria-label="Close"
          >
            <CrossLargeIcon />
          </DeprecatedIconButton>
        </PopoverClose>
      </Flex>
      <Separator />
    </Box>
  );
};

export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;
export const PopoverPortal = PopoverPrimitive.Portal;
