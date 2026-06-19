import React from "react";
import { Box, Text, useInput } from "ink";

interface PreviewProps {
  config: {
    name: string;
    framework: string;
    features: string[];
    agents: string[];
  };
  onConfirm: () => void;
}

interface TreeItem {
  line: string;
  desc: string;
  dim: boolean;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: "Next.js (App Router)",
  react: "React + Vite",
  express: "Node.js + Express",
};

const FEATURE_LABELS: Record<string, string> = {
  typescript: "TypeScript",
  tailwind: "Tailwind CSS",
  shadcn: "shadcn/ui",
  auth: "NextAuth",
  router: "React Router v6",
  prisma: "Prisma + PostgreSQL",
  jwt: "JWT Auth",
  cors: "CORS + Helmet",
  swagger: "Swagger Docs",
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

function getNextjsTree(config: PreviewProps["config"]): TreeItem[] {
  const tree: TreeItem[] = [];
  const has = (f: string) => config.features.includes(f);
  const hasAgent = (a: string) => config.agents.includes(a);

  tree.push({ line: `${config.name}/`, desc: "project root", dim: false });
  tree.push({ line: "├── src/", desc: "source files", dim: false });
  tree.push({ line: "│   ├── app/", desc: "pages, layouts & routes", dim: true });
  tree.push({ line: "│   │   ├── layout.tsx", desc: "root layout", dim: true });
  tree.push({ line: "│   │   ├── page.tsx", desc: "home page", dim: true });
  tree.push({ line: "│   │   └── globals.css", desc: "global styles", dim: true });
  tree.push({ line: "│   ├── components/", desc: "reusable UI components", dim: true });
  if (has("shadcn")) tree.push({ line: "│   │   └── ui/", desc: "shadcn components", dim: true });
  tree.push({ line: "│   └── lib/", desc: "utilities & helpers", dim: true });
  if (has("auth")) tree.push({ line: "│       ├── auth.ts", desc: "NextAuth config", dim: true });
  if (has("prisma")) tree.push({ line: "│       └── prisma.ts", desc: "Prisma client singleton", dim: true });
  tree.push({ line: "├── public/", desc: "static assets", dim: false });
  if (has("prisma")) {
    tree.push({ line: "├── prisma/", desc: "database schema", dim: false });
    tree.push({ line: "│   └── schema.prisma", desc: "data models", dim: true });
  }
  addAgentLines(tree, hasAgent);
  addSharedLines(tree, has);
  tree.push({ line: "├── next.config.ts", desc: "Next.js config", dim: false });
  tree.push({ line: "├── package.json", desc: "dependencies & scripts", dim: false });
  if (has("typescript")) tree.push({ line: "├── tsconfig.json", desc: "TypeScript config", dim: false });
  if (has("tailwind")) tree.push({ line: "├── tailwind.config.ts", desc: "Tailwind config", dim: false });
  if (has("eslint")) tree.push({ line: "├── eslint.config.mjs", desc: "linting rules", dim: false });
  tree.push({ line: "└── README.md", desc: "project docs", dim: false });
  return tree;
}

function getReactTree(config: PreviewProps["config"]): TreeItem[] {
  const tree: TreeItem[] = [];
  const has = (f: string) => config.features.includes(f);
  const hasAgent = (a: string) => config.agents.includes(a);

  tree.push({ line: `${config.name}/`, desc: "project root", dim: false });
  tree.push({ line: "├── src/", desc: "source files", dim: false });
  tree.push({ line: "│   ├── components/", desc: "reusable UI components", dim: true });
  if (has("shadcn")) tree.push({ line: "│   │   └── ui/", desc: "shadcn components", dim: true });
  if (has("router")) tree.push({ line: "│   ├── pages/", desc: "page-level components", dim: true });
  tree.push({ line: "│   ├── hooks/", desc: "custom React hooks", dim: true });
  tree.push({ line: "│   ├── lib/", desc: "utilities & helpers", dim: true });
  tree.push({ line: "│   ├── App.tsx", desc: "root component & routes", dim: true });
  tree.push({ line: "│   └── main.tsx", desc: "entry point", dim: true });
  tree.push({ line: "├── public/", desc: "static assets", dim: false });
  addAgentLines(tree, hasAgent);
  addSharedLines(tree, has);
  tree.push({ line: "├── vite.config.ts", desc: "Vite config", dim: false });
  tree.push({ line: "├── package.json", desc: "dependencies & scripts", dim: false });
  if (has("typescript")) tree.push({ line: "├── tsconfig.json", desc: "TypeScript config", dim: false });
  if (has("eslint")) tree.push({ line: "├── eslint.config.mjs", desc: "linting rules", dim: false });
  tree.push({ line: "└── README.md", desc: "project docs", dim: false });
  return tree;
}

function getExpressTree(config: PreviewProps["config"]): TreeItem[] {
  const tree: TreeItem[] = [];
  const has = (f: string) => config.features.includes(f);
  const hasAgent = (a: string) => config.agents.includes(a);

  tree.push({ line: `${config.name}/`, desc: "project root", dim: false });
  tree.push({ line: "├── src/", desc: "source files", dim: false });
  tree.push({ line: "│   ├── routes/", desc: "Express route handlers", dim: true });
  tree.push({ line: "│   ├── middleware/", desc: "custom middleware", dim: true });
  tree.push({ line: "│   ├── controllers/", desc: "business logic", dim: true });
  if (has("prisma")) tree.push({ line: "│   ├── lib/", desc: "utilities", dim: true });
  if (has("prisma")) tree.push({ line: "│   │   └── prisma.ts", desc: "Prisma client singleton", dim: true });
  tree.push({ line: "│   └── index.ts", desc: "server entry point", dim: true });
  if (has("prisma")) {
    tree.push({ line: "├── prisma/", desc: "database schema", dim: false });
    tree.push({ line: "│   └── schema.prisma", desc: "data models", dim: true });
  }
  addAgentLines(tree, hasAgent);
  addSharedLines(tree, has);
  tree.push({ line: "├── package.json", desc: "dependencies & scripts", dim: false });
  if (has("typescript")) tree.push({ line: "├── tsconfig.json", desc: "TypeScript config", dim: false });
  if (has("eslint")) tree.push({ line: "├── eslint.config.mjs", desc: "linting rules", dim: false });
  tree.push({ line: "└── README.md", desc: "project docs", dim: false });
  return tree;
}

function addAgentLines(tree: TreeItem[], hasAgent: (a: string) => boolean): void {
  if (hasAgent("claude")) {
    tree.push({ line: "├── .claude/", desc: "", dim: false });
    tree.push({ line: "│   └── CLAUDE.md", desc: "project context for Claude", dim: true });
  }
  if (hasAgent("gemini")) tree.push({ line: "├── GEMINI.md", desc: "project context for Gemini", dim: false });
  if (hasAgent("cursor")) {
    tree.push({ line: "├── .cursor/", desc: "", dim: false });
    tree.push({ line: "│   └── rules", desc: "Cursor AI rules", dim: true });
  }
  if (hasAgent("windsurf")) tree.push({ line: "├── .windsurfrules", desc: "Windsurf AI rules", dim: false });
  if (hasAgent("opencode") || hasAgent("codex")) tree.push({ line: "├── AGENTS.md", desc: "agent instructions", dim: false });
  if (hasAgent("copilot")) {
    tree.push({ line: "├── .github/", desc: "", dim: false });
    tree.push({ line: "│   └── copilot-instructions.md", desc: "Copilot instructions", dim: true });
  }
  if (hasAgent("cline")) tree.push({ line: "├── .clinerules", desc: "Cline AI rules", dim: false });
}

function addSharedLines(tree: TreeItem[], has: (f: string) => boolean): void {
  if (has("docker")) {
    tree.push({ line: "├── Dockerfile", desc: "container image", dim: false });
    tree.push({ line: "├── docker-compose.yml", desc: "local dev services", dim: false });
  }
  if (has("ci")) {
    tree.push({ line: "├── .github/", desc: "", dim: false });
    tree.push({ line: "│   └── workflows/ci.yml", desc: "GitHub Actions pipeline", dim: true });
  }
  tree.push({ line: "├── .env.local", desc: "env variables (gitignored)", dim: false });
  tree.push({ line: "├── .gitignore", desc: "git ignore rules", dim: false });
}

function getFileTree(config: PreviewProps["config"]): TreeItem[] {
  if (config.framework === "react") return getReactTree(config);
  if (config.framework === "express") return getExpressTree(config);
  return getNextjsTree(config);
}

export function Preview({ config, onConfirm }: PreviewProps) {
  useInput((_input, key) => {
    if (key.return) onConfirm();
  });

  const tree = getFileTree(config);
  const frameworkLabel = FRAMEWORK_LABELS[config.framework] ?? config.framework;

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" gap={4} alignItems="flex-start">
        <Box flexDirection="column" flexShrink={0}>
          {tree.map((item, i) => (
            <Box key={i}>
              <Text dimColor={item.dim} color={!item.dim ? "white" : undefined}>
                {item.line}
              </Text>
              {item.desc ? <Text dimColor>{"  "}{item.desc}</Text> : null}
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" gap={1} flexShrink={0}>
          <Box flexDirection="column">
            <Text dimColor>PROJECT</Text>
            <Text color="cyan" bold>{config.name}</Text>
          </Box>

          <Box flexDirection="column">
            <Text dimColor>FRAMEWORK</Text>
            <Text color="white">{frameworkLabel}</Text>
          </Box>

          {config.features.length > 0 && (
            <Box flexDirection="column">
              <Text dimColor>FEATURES</Text>
              {config.features.map((f) => (
                <Text key={f} color="green">+ {FEATURE_LABELS[f] ?? f}</Text>
              ))}
            </Box>
          )}

          {config.agents.length > 0 && (
            <Box flexDirection="column">
              <Text dimColor>AI AGENTS</Text>
              {config.agents.map((a) => (
                <Text key={a} color="green">+ {AGENT_LABELS[a] ?? a}</Text>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box marginTop={1} flexDirection="row" alignItems="center" gap={2}>
        <Text color="green" bold inverse>{" "}Generate Project{" "}</Text>
        <Text dimColor>press enter to create your project</Text>
      </Box>
    </Box>
  );
}
