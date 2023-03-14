import type { MouseEvent } from "react";
import { useStore } from "@nanostores/react";
import { findPageByIdOrPath, Page } from "@webstudio-is/project-build";
import { pagesStore, useIsPreviewMode } from "~/shared/nano-states";
import { publish } from "~/shared/pubsub";

declare module "~/shared/pubsub" {
  export interface PubsubMap {
    switchPage: { pageId: Page["id"] | "home" };
  }
}

const isAbsoluteUrl = (href: string) => {
  try {
    new URL(href);
    return true;
  } catch {
    return false;
  }
};

export const useHandleLinkClick = () => {
  const pages = useStore(pagesStore);
  const [isPreviewMode] = useIsPreviewMode();

  return (event: MouseEvent) => {
    event.preventDefault();

    if (isPreviewMode === false || pages === undefined) {
      return;
    }

    const href = event.currentTarget.getAttribute("href");

    if (href === null) {
      return;
    }

    const page = findPageByIdOrPath(pages, href);

    if (page) {
      publish({
        type: "switchPage",
        payload: { pageId: page.id === pages.homePage.id ? "home" : page.id },
      });
      return;
    }

    if (isAbsoluteUrl(href)) {
      window.open(href, "_blank");
    }
  };
};
