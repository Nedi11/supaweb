import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma, PrismaType } from "./server/db";
declare module "@remix-run/node" {
  export interface AppLoadContext {
    prisma: PrismaType;
  }
}
