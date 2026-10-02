import type { TestProject } from "vitest/node";
import { runPrisma, startTestDatabase } from "./database";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
    databaseServerUrl: string;
  }
}

// One throwaway Postgres for the whole run, migrated exactly like production
export default async function setup(project: TestProject) {
  const database = await startTestDatabase();

  try {
    await runPrisma(["migrate", "deploy"], database.url);
  } catch (error) {
    await database.stop();
    throw error;
  }

  project.provide("databaseUrl", database.url);
  project.provide("databaseServerUrl", database.baseUrl);

  return () => database.stop();
}
