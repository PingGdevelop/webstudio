import { forwardRef, type ComponentProps, type Ref } from "react";
import { styled, theme, css, type CSS } from "../stitches.config";
import { Root, Viewport, Scrollbar, Thumb } from "@radix-ui/react-scroll-area";

const ScrollAreaRoot = styled(Root, {
  boxSizing: "border-box",
  overflow: "hidden",
  display: "grid",
});

const ScrollAreaThumb = styled(Thumb, {
  boxSizing: "border-box",
  background: theme.colors.foregroundScrollBar,
  borderRadius: theme.spacing[4],
  // increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

  position: "relative",

  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
  },

  variants: {
    orientation: {
      vertical: {
        "&::before": {
          minWidth: 16,
          minHeight: 44,
        },
      },
      horizontal: {
        minHeight: "100%",
        "&::before": {
          minWidth: 44,
          minHeight: 16,
        },
      },
    },
  },
});

const ScrollAreaScrollbar = styled(Scrollbar, {
  boxSizing: "border-box",
  // ensures no selection
  userSelect: "none",
  // disable browser handling of all panning and scaleUp gestures on touch devices
  padding: 2,
  touchAction: "none",
  '&[data-orientation="vertical"]': {
    width: theme.spacing[6],
    paddingRight: 3,
  },
  '&[data-orientation="horizontal"]': {
    flexDirection: "column",
    height: theme.spacing[6],
    paddingBottom: 3,
  },

  variants: {
    direction: {
      both: {
        "&[data-orientation=vertical]": {
          marginBottom: theme.spacing[4],
        },
        '&[data-orientation="horizontal"]': {
          marginRight: theme.spacing[4],
        },
      },
      horizontal: {},
      vertical: {},
    },
  },
});

const viewPortStyle = css({
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  borderRadius: "inherit",

  variants: {
    direction: {
      // https://github.com/radix-ui/primitives/issues/926#issuecomment-1015279283
      vertical: { "& > div[style]": { display: "block !important" } },
      horizontal: {},
      both: {},
    },
  },
});

type ScrollAreaProps = {
  css?: CSS;
  direction?: "vertical" | "horizontal" | "both";
  className?: string;
} & Pick<ComponentProps<"div">, "onScroll" | "children">;

export const ScrollArea = forwardRef(
  (
    {
      children,
      css,
      className,
      onScroll,
      direction = "vertical",
    }: ScrollAreaProps,
    ref: Ref<HTMLDivElement>
  ) => {
    return (
      <ScrollAreaRoot scrollHideDelay={0} css={css} className={className}>
        <Viewport
          ref={ref}
          className={viewPortStyle({ direction })}
          onScroll={onScroll}
        >
          {children}
        </Viewport>
        {(direction === "vertical" || direction === "both") && (
          <ScrollAreaScrollbar orientation="vertical" direction={direction}>
            <ScrollAreaThumb orientation="vertical" />
          </ScrollAreaScrollbar>
        )}
        {(direction === "horizontal" || direction === "both") && (
          <ScrollAreaScrollbar orientation="horizontal" direction={direction}>
            <ScrollAreaThumb orientation="horizontal" />
          </ScrollAreaScrollbar>
        )}
      </ScrollAreaRoot>
    );
  }
);
ScrollArea.displayName = "ScrollArea";
