import { useStore } from "@nanostores/react";
import { useNavigate } from "@remix-run/react";
import { findPageByIdOrPath, type Page } from "@webstudio-is/project-build";
import { useEffect } from "react";
import {
  authTokenStore,
  pagesStore,
  projectStore,
  selectedPageStore,
  selectedPageIdStore,
  selectedPageHashStore,
  selectedInstanceSelectorStore,
} from "~/shared/nano-states";
import { builderPath } from "~/shared/router-utils";
import { useSyncInitializeOnce } from "../hook-utils";

export const switchPage = (pageId?: Page["id"], pageHash?: string) => {
  const project = projectStore.get();
  const pages = pagesStore.get();

  if (project === undefined || pages === undefined) {
    return;
  }

  const page = findPageByIdOrPath(pages, pageId ?? "");

  selectedInstanceSelectorStore.set(undefined);
  selectedPageHashStore.set(pageHash ?? "");
  selectedPageIdStore.set(page?.id ?? pages.homePage.id);
};

const setPageStateFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const pages = pagesStore.get();

  const pageId = searchParams.get("pageId") ?? pages?.homePage.id;
  const pageHash = searchParams.get("pageHash") ?? "";

  switchPage(pageId, pageHash);
};

export const useSyncPageUrl = () => {
  const navigate = useNavigate();
  const page = useStore(selectedPageStore);
  const pageHash = useStore(selectedPageHashStore);

  // Get pageId and pageHash from URL
  useSyncInitializeOnce(() => {
    setPageStateFromUrl();
  });

  useEffect(() => {
    window.addEventListener("popstate", setPageStateFromUrl);
    return () => {
      window.removeEventListener("popstate", setPageStateFromUrl);
    };
  }, []);

  useEffect(() => {
    const project = projectStore.get();
    const pages = pagesStore.get();

    if (page === undefined || project === undefined || pages === undefined) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    const searchParamsPageId = searchParams.get("pageId") ?? pages.homePage.id;
    const searchParamsPageHash = searchParams.get("pageHash") ?? "";

    if (searchParamsPageId === page.id && searchParamsPageHash === pageHash) {
      return;
    }

    navigate(
      builderPath({
        projectId: project.id,
        pageId: page.id === pages.homePage.id ? undefined : page.id,
        authToken: authTokenStore.get(),
        pageHash: pageHash === "" ? undefined : pageHash,
      })
    );
  }, [navigate, page, pageHash]);
};
