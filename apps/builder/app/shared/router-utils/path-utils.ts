import type { AUTH_PROVIDERS } from "~/shared/session";
import type { Project } from "@webstudio-is/project";
import { $authToken } from "../nano-states";
import { publicStaticEnv } from "~/env/env.static";

const searchParams = (params: Record<string, string | undefined | null>) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }
  const asString = searchParams.toString();
  return asString === "" ? "" : `?${asString}`;
};

export const builderPath = ({
  projectId,
  pageId,
  authToken,
  pageHash,
  mode,
}: {
  projectId: string;
  pageId?: string;
  authToken?: string;
  pageHash?: string;
  mode?: "preview";
}) => {
  return `/builder/${projectId}${searchParams({
    pageId,
    authToken,
    pageHash,
    mode,
  })}`;
};

export const builderUrl = (props: {
  projectId: string;
  pageId?: string;
  origin: string;
  authToken?: string;
  mode?: "edit" | "preview";
}) => {
  const { projectId, pageId, authToken } = props;
  const url = new URL(
    builderPath({ projectId, pageId, authToken }),
    props.origin
  );

  if (props.mode !== undefined) {
    url.searchParams.set("mode", props.mode);
  }

  return url.href;
};

export const dashboardPath = () => {
  return "/dashboard";
};

export const builderDomainsPath = (method: string) => {
  const authToken = $authToken.get();
  const urlSearchParams = new URLSearchParams();
  if (authToken !== undefined) {
    urlSearchParams.set("authToken", authToken);
  }
  const urlSearchParamsString = urlSearchParams.toString();

  return `/builder/domains/${method}${
    urlSearchParamsString ? `?${urlSearchParamsString}` : ""
  }`;
};

export const projectsPath = (
  method: string,
  { authToken }: { authToken?: string } = {}
) => {
  const path = `/rest/projects/${method}`;
  if (authToken === undefined) {
    return path;
  }
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set("authToken", authToken);
  return path + `?${urlSearchParams.toString()}`;
};

export const dashboardProjectsPath = (method: string) =>
  `${dashboardPath()}/projects/${method}`;

export const authorizationTokenPath = (method: string) =>
  `/rest/authorization-token/${method}`;

export const loginPath = (params: {
  error?: (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];
  message?: string;
  returnTo?: string;
}) => `/login${searchParams(params)}`;

export const logoutPath = () => "/logout";

export const userPlanSubscriptionPath = () => {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set("return_url", window.location.href);

  return `/n8n/billing_portal/sessions?${urlSearchParams.toString()}`;
};

export const authCallbackPath = ({
  provider,
}: {
  provider: "google" | "github";
}) => `/auth/${provider}/callback`;

export const authPath = ({
  provider,
}: {
  provider: "google" | "github" | "dev";
}) => `/auth/${provider}`;

export const restAssetsPath = ({ authToken }: { authToken?: string }) => {
  const urlSearchParams = new URLSearchParams();
  if (authToken !== undefined) {
    urlSearchParams.set("authToken", authToken);
  }
  const urlSearchParamsString = urlSearchParams.toString();

  return `/rest/assets${
    urlSearchParamsString ? `?${urlSearchParamsString}` : ""
  }`;
};

export const restAssetsUploadPath = ({ name }: { name: string }) => {
  return `/rest/assets/${name}`;
};

export const restPatchPath = (props: { authToken?: string }) => {
  const urlSearchParams = new URLSearchParams();
  if (props.authToken !== undefined) {
    urlSearchParams.set("authToken", props.authToken);
  }

  urlSearchParams.set("client-version", publicStaticEnv.VERSION);

  const urlSearchParamsString = urlSearchParams.toString();

  return `/rest/patch${
    urlSearchParamsString ? `?${urlSearchParamsString}` : ""
  }`;
};

export const getBuildUrl = ({ project }: { project: Project }) => {
  // const url = new URL(buildOrigin);
  const searchParams = new URLSearchParams();
  searchParams.set("projectId", project.id);

  return `/?${searchParams.toString()}`;
};

export const restAi = (subEndpoint?: "detect" | "audio/transcriptions") =>
  typeof subEndpoint === "string" ? `/rest/ai/${subEndpoint}` : "/rest/ai";

export const restResourcesLoader = () => `/rest/resources-loader`;

export const marketplacePath = (method: string) =>
  `/builder/marketplace/${method}`;
