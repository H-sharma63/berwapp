import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import { generateNextjs } from "./frameworks/nextjs.js";
import { generateReact } from "./frameworks/react.js";
import { generateExpress } from "./frameworks/express.js";
import { generatePrisma } from "./features/prisma.js";
import { generateAuth } from "./features/auth.js";
import { generateDocker } from "./features/docker.js";
import { generateCI } from "./features/ci.js";
import { generateEnvLocal } from "./features/env.js";
import { generatePrettier } from "./features/prettier.js";
import { generateVSCode } from "./features/vscode.js";
import { generateReadme } from "./features/readme.js";
import { generateAgentConfigs } from "../agents/index.js";

interface ProjectConfig {
  name: string;
  framework: string;
  features: string[];
  agents: string[];
}

export type StepCallback = (message: string) => void;

async function safeRemove(dir: string): Promise<void> {
  try {
    if (await fs.pathExists(dir)) {
      await fs.remove(dir);
    }
  } catch {
    // Ignore cleanup errors — Windows Defender / file locks can cause this.
  }
}

async function runStep(
  label: string,
  fn: () => Promise<void>,
  onStep: StepCallback
): Promise<void> {
  onStep(label);
  try {
    await fn();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed at "${label}": ${message}`);
  }
}

export async function generateProject(
  config: ProjectConfig,
  targetDir: string,
  onStep: StepCallback
): Promise<void> {
  const has = (f: string) => config.features.includes(f);
  const projectDir = path.join(targetDir, config.name);

  const handleSigint = () => {
    safeRemove(projectDir).finally(() => process.exit(1));
  };
  process.once("SIGINT", handleSigint);

  try {
    // Step 1: Framework base
    if (config.framework === "nextjs") {
      await runStep("Running create-next-app...", () =>
        generateNextjs(config.name, projectDir, config.features),
      onStep);
    } else if (config.framework === "react") {
      await runStep("Running create-vite...", () =>
        generateReact(config.name, projectDir, config.features),
      onStep);
    } else if (config.framework === "express") {
      await runStep("Scaffolding Express app...", () =>
        generateExpress(config.name, projectDir, config.features),
      onStep);
    }

    // Step 2: Prisma (Next.js and Express)
    if (has("prisma") && config.framework !== "react") {
      await runStep("Setting up Prisma...", () =>
        generatePrisma(projectDir),
      onStep);
    }

    // Step 3: Auth (Next.js only — NextAuth)
    if (has("auth") && config.framework === "nextjs") {
      await runStep("Adding NextAuth...", () =>
        generateAuth(projectDir),
      onStep);
    }

    // Step 4: shadcn/ui (Next.js and React+Vite)
    if (has("shadcn") && config.framework !== "express") {
      await runStep("Initialising shadcn/ui...", () =>
        execa("npx", ["shadcn@latest", "init", "--yes", "--defaults"], {
          cwd: projectDir,
          stdio: "pipe",
        }).then(() => {}),
      onStep);
    }

    // Step 5: Docker
    if (has("docker")) {
      await runStep("Adding Docker setup...", () =>
        generateDocker(config.name, projectDir),
      onStep);
    }

    // Step 6: CI/CD
    if (has("ci")) {
      await runStep("Adding GitHub Actions...", () =>
        generateCI(projectDir),
      onStep);
    }

    // Step 7: Prettier
    if (has("eslint")) {
      await runStep("Adding Prettier config...", () =>
        generatePrettier(projectDir),
      onStep);
    }

    // Step 8: Env files
    await runStep("Writing .env files...", () =>
      generateEnvLocal(projectDir, config.features),
    onStep);

    // Step 9: README
    await runStep("Writing README...", () =>
      generateReadme(projectDir, config),
    onStep);

    // Step 10: VS Code settings
    await runStep("Adding VS Code settings...", () =>
      generateVSCode(projectDir, config.features),
    onStep);

    // Step 11: Agent configs
    if (config.agents.length > 0) {
      await runStep("Generating AI agent configs...", () =>
        generateAgentConfigs(config, projectDir),
      onStep);
    }

    // Step 12: Install dependencies
    await runStep("Installing dependencies...", () =>
      execa("npm", ["install"], { cwd: projectDir, stdio: "pipe" }).then(() => {}),
    onStep);

    // Step 13: Git init
    await runStep("Initialising git...", async () => {
      await execa("git", ["init"], { cwd: projectDir, stdio: "pipe" });
      await execa("git", ["add", "-A"], { cwd: projectDir, stdio: "pipe" });
      await execa("git", ["commit", "-m", "init: scaffold with berwapp"], {
        cwd: projectDir,
        stdio: "pipe",
      });
    }, onStep);

    onStep("Done!");
  } catch (err: unknown) {
    await safeRemove(projectDir);
    throw err;
  } finally {
    process.removeListener("SIGINT", handleSigint);
  }
}
