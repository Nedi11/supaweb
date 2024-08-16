import { PrismaClient } from "@prisma/client";

import { withBark } from "prisma-extension-bark";
export const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});
// .$extends(withBark({ modelNames: [] }));

export type PrismaType = typeof prisma;
