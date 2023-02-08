import { prisma, type Prisma, type Project } from "@webstudio-is/prisma-client";
import {
  authorizeProject,
  type AppContext,
} from "@webstudio-is/trpc-interface/server";

export const cloneAssets = async (
  {
    fromProjectId,
    toProjectId,
    dontCheckEditPermission = false,
  }: {
    fromProjectId: Project["id"];
    toProjectId: Project["id"];
    dontCheckEditPermission?: boolean;
  },
  context: AppContext,
  client: Prisma.TransactionClient = prisma
) => {
  const canView = await authorizeProject.hasProjectPermit(
    { projectId: fromProjectId, permit: "view" },
    context
  );

  if (canView === false) {
    throw new Error("You don't have access to this project assets");
  }

  if (dontCheckEditPermission === false) {
    const canEdit = await authorizeProject.hasProjectPermit(
      { projectId: toProjectId, permit: "edit" },
      context
    );

    if (canEdit === false) {
      throw new Error("You don't have access to create this project assets");
    }
  }

  const assets = await client.asset.findMany({
    where: { projectId: fromProjectId, status: "UPLOADED" },
  });

  await client.asset.createMany({
    data: assets.map((asset) => ({ ...asset, projectId: toProjectId })),
  });
};
