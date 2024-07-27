import type { DataSources } from "./schema/data-sources";
import type { Page } from "./schema/pages";
import type { Resources } from "./schema/resources";
import type { Scope } from "./scope";
import { generateExpression } from "./expression";

export const generateResources = ({
  scope,
  page,
  dataSources,
  resources,
}: {
  scope: Scope;
  page: Page;
  dataSources: DataSources;
  resources: Resources;
}) => {
  let generatedRequests = "";
  let generatedPairs = "";

  const usedDataSources: DataSources = new Map();

  for (const dataSource of dataSources.values()) {
    if (dataSource.type !== "resource") {
      continue;
    }
    const resource = resources.get(dataSource.resourceId);
    if (resource === undefined) {
      continue;
    }
    let generatedRequest = "";
    // call resource by bound variable name
    const resourceName = scope.getName(resource.id, dataSource.name);
    generatedRequest += `  const ${resourceName}: ResourceRequest = {\n`;
    generatedRequest += `    id: "${resource.id}",\n`;
    generatedRequest += `    name: ${JSON.stringify(resource.name)},\n`;
    const url = generateExpression({
      expression: resource.url,
      dataSources,
      usedDataSources,
      scope,
    });
    generatedRequest += `    url: ${url},\n`;
    generatedRequest += `    method: "${resource.method}",\n`;
    generatedRequest += `    headers: [\n`;
    for (const header of resource.headers) {
      const value = generateExpression({
        expression: header.value,
        dataSources,
        usedDataSources,
        scope,
      });
      generatedRequest += `      { name: "${header.name}", value: ${value} },\n`;
    }
    generatedRequest += `    ],\n`;
    // prevent computing empty expression
    if (resource.body !== undefined && resource.body.length > 0) {
      const body = generateExpression({
        expression: resource.body,
        dataSources,
        usedDataSources,
        scope,
      });
      generatedRequest += `    body: ${body},\n`;
    }
    generatedRequest += `  }\n`;
    generatedRequests += generatedRequest;
    generatedPairs += `    ["${resourceName}", ${resourceName}],\n`;
  }

  let generatedVariables = "";
  for (const dataSource of usedDataSources.values()) {
    if (dataSource.type === "variable") {
      const name = scope.getName(dataSource.id, dataSource.name);
      const value = JSON.stringify(dataSource.value.value);
      generatedVariables += `  let ${name} = ${value}\n`;
    }

    if (dataSource.type === "parameter") {
      // support only page system parameter
      if (dataSource.id !== page.systemDataSourceId) {
        continue;
      }
      const name = scope.getName(dataSource.id, dataSource.name);
      generatedVariables += `  const ${name} = _props.system\n`;
    }
  }

  let generated = "";
  generated += `import type { System, ResourceRequest } from "@webstudio-is/sdk";\n`;
  generated += `export const getResources = (_props: { system: System }) => {\n`;
  generated += generatedVariables;
  generated += generatedRequests;
  generated += `  return new Map<string, ResourceRequest>([\n`;
  generated += generatedPairs;
  generated += `  ])\n`;
  generated += `}\n`;
  return generated;
};
