import path from "path";
import fs from "fs-extra";

export async function generateEnvLocal(
  projectDir: string,
  features: string[]
): Promise<void> {
  const has = (f: string) => features.includes(f);

  const localLines: string[] = ["# Environment Variables", "# Fill in your values below", ""];
  const exampleLines: string[] = ["# Environment Variables", "# Copy this file to .env.local and fill in your values", ""];

  if (has("auth")) {
    localLines.push("# NextAuth");
    localLines.push("NEXTAUTH_URL=http://localhost:3000");
    localLines.push("NEXTAUTH_SECRET=");
    localLines.push("GOOGLE_CLIENT_ID=");
    localLines.push("GOOGLE_CLIENT_SECRET=");
    localLines.push("");

    exampleLines.push("# NextAuth");
    exampleLines.push("NEXTAUTH_URL=http://localhost:3000");
    exampleLines.push("NEXTAUTH_SECRET=your-secret-here  # generate: openssl rand -base64 32");
    exampleLines.push("GOOGLE_CLIENT_ID=your-google-client-id");
    exampleLines.push("GOOGLE_CLIENT_SECRET=your-google-client-secret");
    exampleLines.push("");
  }

  if (has("prisma")) {
    localLines.push("# Database");
    localLines.push(`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${path.basename(projectDir)}`);
    localLines.push("");

    exampleLines.push("# Database");
    exampleLines.push("DATABASE_URL=postgresql://user:password@localhost:5432/dbname");
    exampleLines.push("");
  }

  await fs.writeFile(path.join(projectDir, ".env.local"), localLines.join("\n"), "utf-8");
  await fs.writeFile(path.join(projectDir, ".env.example"), exampleLines.join("\n"), "utf-8");
}
