import slugify from "slugify";
import { customAlphabet } from "nanoid";
import { prisma, Prisma, Project } from "@webstudio-is/prisma-client";
import * as db from "./index";
import {
  authorizeProject,
  type AppContext,
} from "@webstudio-is/trpc-interface/server";
import { v4 as uuid } from "uuid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

export const loadByParams = async (
  params: { projectId: string } | { projectDomain: string },
  context: AppContext
) => {
  return "projectId" in params
    ? await loadById(params.projectId, context)
    : await loadByDomain(params.projectDomain, context);
};

export const loadById = async (
  projectId: Project["id"],
  context: AppContext
) => {
  // ensure user or token has access to project
  const canRead = await authorizeProject.hasProjectPermit(
    { projectId, permit: "view" },
    context
  );

  if (canRead === false) {
    throw new Error("You don't have access to this project");
  }

  return await prisma.project.findUnique({
    where: { id: projectId },
  });
};

export const loadByDomain = async (
  domain: string,
  context: AppContext
): Promise<Project | null> => {
  // Authorization system needs project id to check if user has access to project
  const projectWithId = await prisma.project.findUnique({
    where: { domain: domain.toLowerCase() },
  });

  if (projectWithId === null) {
    return null;
  }

  // Edge case for webstudiois project
  if (projectWithId.domain === "webstudiois") {
    // Hardcode for now that everyone can duplicate webstudiois project
    return projectWithId;
  }

  // Otherwise check if user has access to project
  return await loadById(projectWithId.id, context);
};

export const loadManyByCurrentUserId = async (
  context: AppContext
): Promise<Array<Project>> => {
  const userId = context.authorization.userId;
  if (userId === undefined) {
    throw new Error("User must be authenticated to list projects");
  }

  return await prisma.project.findMany({
    where: {
      user: {
        id: userId,
      },
    },
  });
};

const slugifyOptions = { lower: true, strict: true };

const MIN_DOMAIN_LENGTH = 10;
const MIN_TITLE_LENGTH = 2;

const generateDomain = (title: string) => {
  const slugifiedTitle = slugify(title, slugifyOptions);
  const domain = `${slugifiedTitle}-${nanoid(
    // If user entered a long title already, we just add 5 chars generated id
    // Otherwise we add the amount of chars to satisfy min length
    Math.max(MIN_DOMAIN_LENGTH - slugifiedTitle.length - 1, 5)
  )}`;
  return domain;
};

export const create = async (
  { title }: { title: string },
  context: AppContext
) => {
  if (title.length < MIN_TITLE_LENGTH) {
    return { errors: `Minimum ${MIN_TITLE_LENGTH} characters required` };
  }

  const userId = context.authorization.userId;

  if (userId === undefined) {
    throw new Error("User must be authenticated to create project");
  }

  const projectId = uuid();
  authorizeProject.registerProjectOwnerAndReadToken({ projectId }, context);

  const project = await prisma.$transaction(async (client) => {
    const project = await client.project.create({
      data: {
        id: projectId,
        userId,
        title,
        domain: generateDomain(title),
      },
    });

    await db.build.create(project.id, "dev", undefined, client);

    return project;
  });

  return project;
};

export const markAsDeleted = async (
  projectId: Project["id"],
  context: AppContext
) => {
  const canDelete = await authorizeProject.hasProjectPermit(
    { projectId, permit: "own" },
    context
  );

  if (canDelete === false) {
    throw new Error("Only owner can delete the project");
  }

  return await prisma.project.update({
    where: { id: projectId },
    data: { isDeleted: true },
  });
};

export const rename = async (
  {
    projectId,
    title,
  }: {
    projectId: Project["id"];
    title: string;
  },
  context: AppContext
) => {
  if (title.length < MIN_TITLE_LENGTH) {
    return { errors: `Minimum ${MIN_TITLE_LENGTH} characters required` };
  }

  const canEdit = await authorizeProject.hasProjectPermit(
    { projectId, permit: "edit" },
    context
  );

  if (canEdit === false) {
    throw new Error("Only token or user with edit permission can edit project");
  }

  return await prisma.project.update({
    where: { id: projectId },
    data: { title },
  });
};

const clone = async (
  {
    project,
    title,
    env = "dev",
  }: {
    project: Project;
    title?: string;
    env?: "dev" | "prod";
  },
  context: AppContext
) => {
  const userId = context.authorization.userId;

  if (userId === undefined) {
    throw new Error("User must be authenticated to clone project");
  }

  const build =
    env === "dev"
      ? await db.build.loadByProjectId(project.id, "dev")
      : await db.build.loadByProjectId(project.id, "prod");

  const projectId = uuid();
  authorizeProject.registerProjectOwnerAndReadToken({ projectId }, context);

  const clonedProject = await prisma.$transaction(async (client) => {
    const clonedProject = await client.project.create({
      data: {
        id: projectId,
        userId: userId,
        title: title ?? project.title,
        domain: generateDomain(project.title),
      },
    });

    await db.build.create(clonedProject.id, "dev", build, client);

    return clonedProject;
  });

  return clonedProject;
};

export const duplicate = async (projectId: string, context: AppContext) => {
  const project = await loadById(projectId, context);
  if (project === null) {
    throw new Error(`Not found project "${projectId}"`);
  }
  return await clone(
    {
      project,
      title: `${project.title} (copy)`,
    },
    context
  );
};

export const cloneByDomain = async (domain: string, context: AppContext) => {
  const project = await loadByDomain(domain, context);

  if (project === null) {
    throw new Error(`Not found project "${domain}"`);
  }

  return await clone({ project, env: "prod" }, context);
};

export const updateDomain = async (
  input: {
    id: string;
    domain: string;
  },
  context: AppContext
) => {
  const domain = slugify(input.domain, slugifyOptions);

  if (domain.length < MIN_DOMAIN_LENGTH) {
    throw new Error(`Minimum ${MIN_DOMAIN_LENGTH} characters required`);
  }

  const canEdit = await authorizeProject.hasProjectPermit(
    { projectId: input.id, permit: "edit" },
    context
  );

  if (canEdit === false) {
    throw new Error("Only token or user with edit permission can edit project");
  }

  try {
    const project = await prisma.project.update({
      data: { domain },
      where: { id: input.id },
    });
    return project;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(`Domain "${domain}" is already used`);
    }
    throw error;
  }
};
