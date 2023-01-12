/**
 * Implementation of the "Button" component from:
 * https://www.figma.com/file/sfCE7iLS0k25qCxiifQNLE/%F0%9F%93%9A-Webstudio-Library?node-id=0%3A1
 */

import React, { forwardRef, type Ref, type ComponentProps } from "react";
import { styled } from "../stitches.config";

// CSS supports multiple gradients as backgrounds but not multiple colors
const backgroundColors = ({
  overlay,
  base,
}: {
  overlay: string;
  base: string;
}) =>
  `linear-gradient(${overlay}, ${overlay}), linear-gradient(${base}, ${base})`;

const backgroundStyle = (baseColor: string) => ({
  background: baseColor,
  "&:hover": {
    background: backgroundColors({
      base: baseColor,
      overlay: "$colors$backgroundButtonHover",
    }),
  },
  "&:active": {
    background: backgroundColors({
      base: baseColor,
      overlay: "$colors$backgroundButtonPressed",
    }),
  },
});

const StyledButton = styled("button", {
  all: "unset",
  boxSizing: "border-box",
  minWidth: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "$spacing$2",
  color: "$colors$foregroundContrastMain",
  padding: "0 $spacing$4",
  height: "$spacing$12",
  borderRadius: "$borderRadius$4",

  // @todo: this is `typography > labels`, it should be taken from tokens or from text.tsx
  fontWeight: 500,
  fontFamily: "$fonts$sans",
  fontSize: "$fontSize$3",
  lineHeight: "$lineHeight$3",
  letterSpacing: "0.005em",

  variants: {
    // "variant" is used instead of "type" as in Figma,
    // because type is already taken for type=submit etc.
    variant: {
      primary: { ...backgroundStyle("$colors$backgroundPrimary") },
      neutral: {
        ...backgroundStyle("$colors$backgroundNeutralMain"),
        color: "$colors$foregroundMain",
      },
      destructive: { ...backgroundStyle("$colors$backgroundDestructiveMain") },
      positive: { ...backgroundStyle("$colors$backgroundSuccessMain") },
      ghost: {
        ...backgroundStyle("$colors$backgroundHover"),
        background: "transparent",
        color: "$colors$foregroundMain",
      },
    },
    pending: {
      true: {
        cursor: "wait",
      },
      false: {
        "&[disabled]": {
          background: "$colors$backgroundButtonDisabled",
          color: "$colors$foregroundDisabled",
        },
      },
    },
  },

  defaultVariants: {
    variant: "primary",
  },
});

const TextContainer = styled("span", {
  display: "block",
  padding: "0 $spacing$2",
});

type ButtonProps = Omit<ComponentProps<typeof StyledButton>, "pending"> & {
  pending?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export const Button = forwardRef(
  (
    {
      icon,
      pending = false,
      disabled,
      iconPosition = "left",
      children,
      ...restProps
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
  ) => {
    return (
      <StyledButton
        {...restProps}
        pending={pending}
        disabled={disabled || pending}
        ref={ref}
      >
        {iconPosition === "left" && icon}
        {children && (
          <TextContainer>
            {children}
            {pending ? "…" : ""}
          </TextContainer>
        )}
        {iconPosition === "right" && icon}
      </StyledButton>
    );
  }
);
Button.displayName = "Button";
