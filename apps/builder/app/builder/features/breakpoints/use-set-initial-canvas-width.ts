import { useEffect } from "react";
import type { Breakpoint } from "@webstudio-is/sdk";
import {
  workspaceRectStore,
  canvasWidthStore,
} from "~/builder/shared/nano-states";
import {
  breakpointsStore,
  selectedBreakpointStore,
} from "~/shared/nano-states";
import { findInitialWidth } from "./find-initial-width";

// Fixes initial canvas width jump on wide screens.
// Calculate canvas width during SSR based on known initial width for wide screens.
export const setInitialCanvasWidthAsTransaction = (
  canvasWidthStore: { value: number | undefined },
  breakpointId: Breakpoint["id"]
) => {
  const workspaceRect = workspaceRectStore.get();
  const breakpoints = breakpointsStore.get();
  const breakpoint = breakpoints.get(breakpointId);
  if (workspaceRect === undefined || breakpoint === undefined) {
    return false;
  }

  const width = findInitialWidth(
    Array.from(breakpoints.values()),
    breakpoint,
    workspaceRect.width
  );
  canvasWidthStore.value = width;
  return true;
};

/**
 *  Update canvas width initially and on breakpoint change
 **/
export const useSetCanvasWidth = () => {
  useEffect(() => {
    const update = () => {
      const breakpoints = breakpointsStore.get();
      const workspaceRect = workspaceRectStore.get();
      if (workspaceRect === undefined || breakpoints.size === 0) {
        return;
      }
      const breakpointValues = Array.from(breakpoints.values());
      const selectedBreakpoint = selectedBreakpointStore.get();

      // When there is selected breakpoint, we want to find the lowest possible size
      // that is bigger than all max breakpoints and smaller than all min breakpoints.
      if (selectedBreakpoint) {
        const width = findInitialWidth(
          breakpointValues,
          selectedBreakpoint,
          workspaceRect.width
        );
        canvasWidthStore.set({ value: width });
      }
    };

    const unsubscribeBreakpointStore = breakpointsStore.subscribe(update);
    const unsubscribeRectStore = workspaceRectStore.listen((workspaceRect) => {
      if (workspaceRect === undefined) {
        return;
      }
      unsubscribeRectStore?.();
      update();
    });

    return () => {
      unsubscribeBreakpointStore();
      unsubscribeRectStore?.();
    };
  }, []);
};
