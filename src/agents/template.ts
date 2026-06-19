interface ProjectConfig {
  name: string;
  framework: string;
  features: string[];
  agents: string[];
}

const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: "Next.js (App Router)",
  react: "React + Vite",
  express: "Node.js + Express",
};

function buildNextjsContext(config: ProjectConfig): string {
  const has = (f: string) => config.features.includes(f);

  const stack: string[] = ["Next.js (App Router)"];
  if (has("typescript")) stack.push("TypeScript");
  if (has("tailwind")) stack.push("Tailwind CSS v4");
  if (has("shadcn")) stack.push("shadcn/ui");
  if (has("auth")) stack.push("NextAuth v5 (Auth.js)");
  if (has("prisma")) stack.push("Prisma + PostgreSQL");
  if (has("docker")) stack.push("Docker");
  if (has("ci")) stack.push("GitHub Actions");
  if (has("eslint")) stack.push("ESLint + Prettier");

  const folders = [
    "src/app/           -> pages, layouts, and API route handlers",
    "src/components/    -> reusable UI components",
    "src/lib/           -> utilities and helpers",
    "public/            -> static assets",
  ];
  if (has("prisma")) folders.push("prisma/            -> database schema and migrations");

  const commands = [
    "npm run dev        -> start dev server (http://localhost:3000)",
    "npm run build      -> production build",
    "npm run lint       -> run ESLint",
  ];
  if (has("prisma")) {
    commands.push("npx prisma migrate dev   -> run database migrations");
    commands.push("npx prisma studio        -> open database GUI");
    commands.push("npx prisma generate      -> regenerate Prisma client");
  }

  const conventions = [
    "Use server components by default - add 'use client' only for browser APIs, event handlers, or hooks",
    "API routes live in src/app/api/ and export named HTTP method functions (GET, POST, etc.)",
    "Keep page.tsx files thin - extract logic into components or lib/ functions",
  ];
  if (has("prisma")) conventions.push("Import Prisma from @/lib/prisma - singleton pattern prevents multiple connections");
  if (has("auth")) conventions.push("Auth config in src/lib/auth.ts - session strategy is JWT not database");
  if (has("tailwind")) conventions.push("Use Tailwind utility classes - avoid custom CSS unless necessary");
  if (has("shadcn")) conventions.push("shadcn/ui components live in src/components/ui/ - copied into your project, not a package import");

  const gotchas = [
    "params and searchParams are async in Next.js 15+ - always await them: const { id } = await params",
    "Do not use 'use client' at the top of page.tsx - pages should be server components",
    "next.config.ts not .js - Next.js 15+ uses TypeScript config",
  ];
  if (has("prisma")) {
    gotchas.push("Run npx prisma generate before npx prisma migrate dev after schema changes");
    gotchas.push("PrismaClient uses globalThis to prevent hot-reload creating multiple connections");
  }
  if (has("auth")) {
    gotchas.push("PrismaAdapter requires a cast: PrismaAdapter(prisma as any) - known type mismatch");
    gotchas.push("NEXTAUTH_SECRET must be set in production - generate: openssl rand -base64 32");
  }
  if (has("tailwind")) {
    gotchas.push("Tailwind v4 uses CSS-based config - tailwind.config.ts is for v3 compatibility only");
  }

  const envVars: string[] = [];
  if (has("auth")) {
    envVars.push("NEXTAUTH_URL=http://localhost:3000");
    envVars.push("NEXTAUTH_SECRET= (generate: openssl rand -base64 32)");
    envVars.push("GOOGLE_CLIENT_ID=");
    envVars.push("GOOGLE_CLIENT_SECRET=");
  }
  if (has("prisma")) {
    envVars.push(`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${config.name}`);
  }

  return buildMarkdown(config.name, stack, folders, commands, conventions, gotchas, envVars);
}

function buildReactContext(config: ProjectConfig): string {
  const has = (f: string) => config.features.includes(f);

  const stack: string[] = ["React + Vite"];
  if (has("typescript")) stack.push("TypeScript");
  if (has("tailwind")) stack.push("Tailwind CSS");
  if (has("shadcn")) stack.push("shadcn/ui");
  if (has("router")) stack.push("React Router v6");
  if (has("docker")) stack.push("Docker");
  if (has("ci")) stack.push("GitHub Actions");
  if (has("eslint")) stack.push("ESLint + Prettier");

  const folders = [
    "src/components/    -> reusable UI components",
    "src/pages/         -> page-level components (one per route)",
    "src/hooks/         -> custom React hooks",
    "src/lib/           -> utilities and helpers",
    "public/            -> static assets",
  ];

  const commands = [
    "npm run dev        -> start dev server (http://localhost:5173)",
    "npm run build      -> production build",
    "npm run preview    -> preview production build",
    "npm run lint       -> run ESLint",
  ];

  const conventions = [
    "This is a client-side SPA - all components run in the browser",
    "Use React Router for navigation - routes defined in src/App.tsx",
    "Keep components small and focused - one component per file",
    "Custom hooks go in src/hooks/ - prefix with 'use'",
  ];
  if (has("tailwind")) conventions.push("Use Tailwind utility classes for styling");
  if (has("shadcn")) conventions.push("shadcn/ui components live in src/components/ui/ - copied into your project");

  const gotchas = [
    "Vite dev server runs on port 5173 not 3000",
    "No server-side rendering - this is a pure client-side app",
    "Environment variables must be prefixed with VITE_ to be accessible in the browser",
    "Import paths use relative imports - configure @ alias in vite.config.ts if needed",
  ];

  return buildMarkdown(config.name, stack, folders, commands, conventions, gotchas, []);
}

function buildExpressContext(config: ProjectConfig): string {
  const has = (f: string) => config.features.includes(f);

  const stack: string[] = ["Node.js + Express"];
  if (has("typescript")) stack.push("TypeScript");
  if (has("cors")) stack.push("CORS + Helmet");
  if (has("prisma")) stack.push("Prisma + PostgreSQL");
  if (has("jwt")) stack.push("JWT Authentication");
  if (has("swagger")) stack.push("Swagger API Docs");
  if (has("docker")) stack.push("Docker");
  if (has("ci")) stack.push("GitHub Actions");
  if (has("eslint")) stack.push("ESLint + Prettier");

  const folders = [
    "src/routes/        -> Express route handlers",
    "src/middleware/    -> custom middleware (auth, error handling)",
    "src/controllers/   -> business logic (keep routes thin)",
  ];
  if (has("prisma")) folders.push("prisma/            -> database schema and migrations");

  const commands = [
    "npm run dev        -> start dev server with ts-node (http://localhost:3000)",
    "npm run build      -> compile TypeScript to dist/",
    "npm start          -> run compiled production build",
    "npm run lint       -> run ESLint",
  ];
  if (has("prisma")) {
    commands.push("npx prisma migrate dev   -> run database migrations");
    commands.push("npx prisma studio        -> open database GUI");
  }

  const conventions = [
    "Routes should be thin - delegate logic to controllers",
    "Always use async/await and wrap route handlers in try/catch or an error middleware",
    "Return consistent JSON responses: { data, error, message }",
  ];
  if (has("cors")) conventions.push("CORS and Helmet are applied globally in src/index.ts");
  if (has("jwt")) conventions.push("JWT middleware verifies tokens in src/middleware/auth.ts");
  if (has("prisma")) conventions.push("Import Prisma from src/lib/prisma.ts - singleton pattern");

  const gotchas = [
    "Express does not catch async errors by default - always use try/catch or pass errors to next()",
    "Helmet sets security headers - some may conflict with frontend CORS in development",
  ];
  if (has("prisma")) {
    gotchas.push("Run npx prisma generate after every schema.prisma change");
  }

  const envVars: string[] = ["PORT=3000"];
  if (has("prisma")) envVars.push(`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${config.name}`);
  if (has("jwt")) envVars.push("JWT_SECRET= (generate: openssl rand -base64 32)");

  return buildMarkdown(config.name, stack, folders, commands, conventions, gotchas, envVars);
}

function buildMarkdown(
  name: string,
  stack: string[],
  folders: string[],
  commands: string[],
  conventions: string[],
  gotchas: string[],
  envVars: string[]
): string {
  let content = `# Project: ${name}

## Stack
${stack.map((s) => `- ${s}`).join("\n")}

## Folder Structure
${folders.map((f) => `- ${f}`).join("\n")}

## Commands
${commands.map((c) => `- ${c}`).join("\n")}

## Conventions
${conventions.map((c) => `- ${c}`).join("\n")}

## Known Gotchas
${gotchas.map((g) => `- ${g}`).join("\n")}
`;

  if (envVars.length > 0) {
    content += `
## Environment Variables
Required in .env.local:
${envVars.map((v) => `- ${v}`).join("\n")}
`;
  }

  content += `
---
*Generated by berwapp - update this file as your project evolves.*
`;

  return content;
}

export function buildProjectContext(config: ProjectConfig): string {
  if (config.framework === "react") return buildReactContext(config);
  if (config.framework === "express") return buildExpressContext(config);
  return buildNextjsContext(config);
}
