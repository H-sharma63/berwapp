import path from "path";
import fs from "fs-extra";

interface ProjectConfig {
  name: string;
  framework: string;
  features: string[];
  agents: string[];
}

const FEATURE_LABELS: Record<string, string> = {
  typescript: "TypeScript",
  tailwind: "Tailwind CSS v4",
  shadcn: "shadcn/ui",
  auth: "NextAuth v5",
  prisma: "Prisma + PostgreSQL",
  docker: "Docker",
  ci: "GitHub Actions",
  eslint: "ESLint + Prettier",
};

const AGENT_LABELS: Record<string, string> = {
  claude: "Claude Code",
  gemini: "Gemini CLI",
  copilot: "GitHub Copilot",
  cursor: "Cursor",
  windsurf: "Windsurf",
  cline: "Cline",
  opencode: "OpenCode",
  codex: "Codex CLI",
};

export async function generateReadme(
  projectDir: string,
  config: ProjectConfig
): Promise<void> {
  const has = (f: string) => config.features.includes(f);

  const stackLines = ["- Next.js (App Router)"];
  for (const f of config.features) {
    if (FEATURE_LABELS[f]) stackLines.push(`- ${FEATURE_LABELS[f]}`);
  }

  const commandLines = [
    "```bash",
    "npm run dev      # start development server",
    "npm run build    # production build",
    "npm run lint     # run ESLint",
  ];
  if (has("prisma")) {
    commandLines.push("npx prisma migrate dev  # run migrations");
    commandLines.push("npx prisma studio       # open database GUI");
  }
  commandLines.push("```");

  const envSection = (has("auth") || has("prisma"))
    ? `## Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in your values:

\`\`\`bash
cp .env.example .env.local
\`\`\`

See \`.env.example\` for all required variables.
`
    : "";

  const agentSection = config.agents.length > 0
    ? `## AI Agent Config

This project was scaffolded with config files for:
${config.agents.map((a) => `- **${AGENT_LABELS[a] ?? a}**`).join("\n")}

The config files contain your project's stack, conventions, and known gotchas - giving your AI agent full context from day one.
`
    : "";

  const readme = `# ${config.name}

> Scaffolded with berwapp

## Stack

${stackLines.join("\n")}

## Getting Started

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

${commandLines.join("\n")}

${envSection}${agentSection}## Project Structure

\`\`\`
src/
+-- app/          # pages, layouts, API routes
+-- components/   # reusable UI components
+-- lib/          # utilities and helpers
\`\`\`
`;

  await fs.writeFile(path.join(projectDir, "README.md"), readme, "utf-8");
}
