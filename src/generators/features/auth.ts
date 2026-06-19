import path from "path";
import fs from "fs-extra";

export async function generateAuth(projectDir: string): Promise<void> {
  // lib/auth.ts — NextAuth v5 config
  const authConfig = `import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
});
`;

  // app/api/auth/[...nextauth]/route.ts — required by NextAuth v5
  const routeHandler = `import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
`;

  await fs.ensureDir(path.join(projectDir, "src", "lib"));
  await fs.writeFile(path.join(projectDir, "src", "lib", "auth.ts"), authConfig, "utf-8");

  await fs.ensureDir(path.join(projectDir, "src", "app", "api", "auth", "[...nextauth]"));
  await fs.writeFile(
    path.join(projectDir, "src", "app", "api", "auth", "[...nextauth]", "route.ts"),
    routeHandler,
    "utf-8"
  );
}
