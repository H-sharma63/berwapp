import { execa } from "execa";
import path from "path";
import fs from "fs-extra";

export async function generatePrisma(projectDir: string): Promise<void> {
  await execa("npx", ["prisma", "init", "--datasource-provider", "postgresql"], {
    cwd: projectDir,
    stdio: "pipe",
  });

  // Replace default schema with one that includes a User model
  const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  await fs.writeFile(path.join(projectDir, "prisma", "schema.prisma"), schema, "utf-8");

  // Add prisma client to lib/
  const prismaClient = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
  await fs.ensureDir(path.join(projectDir, "src", "lib"));
  await fs.writeFile(path.join(projectDir, "src", "lib", "prisma.ts"), prismaClient, "utf-8");
}
