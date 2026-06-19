import path from "path";
import fs from "fs-extra";
import { buildProjectContext } from "./template.js";

interface ProjectConfig {
  name: string;
  framework: string;
  features: string[];
  agents: string[];
}

interface AgentFile {
  filePath: string;
  content: string;
}

function buildAgentFiles(config: ProjectConfig, projectDir: string): AgentFile[] {
  const context = buildProjectContext(config);
  const files: AgentFile[] = [];
  const hasAgent = (a: string) => config.agents.includes(a);

  if (hasAgent("claude")) {
    // Write to .claude/CLAUDE.md (primary location)
    files.push({
      filePath: path.join(projectDir, ".claude", "CLAUDE.md"),
      content: context,
    });
    // Overwrite create-next-app's placeholder CLAUDE.md in root
    files.push({
      filePath: path.join(projectDir, "CLAUDE.md"),
      content: context,
    });
  }

  if (hasAgent("gemini")) {
    files.push({
      filePath: path.join(projectDir, "GEMINI.md"),
      content: context,
    });
  }

  if (hasAgent("cursor")) {
    files.push({
      filePath: path.join(projectDir, ".cursor", "rules"),
      content: context,
    });
  }

  if (hasAgent("windsurf")) {
    files.push({
      filePath: path.join(projectDir, ".windsurfrules"),
      content: context,
    });
  }

  // OpenCode and Codex both use AGENTS.md in root — write once if either is selected
  if (hasAgent("opencode") || hasAgent("codex")) {
    files.push({
      filePath: path.join(projectDir, "AGENTS.md"),
      content: context,
    });
  }

  if (hasAgent("copilot")) {
    files.push({
      filePath: path.join(projectDir, ".github", "copilot-instructions.md"),
      content: context,
    });
  }

  if (hasAgent("cline")) {
    files.push({
      filePath: path.join(projectDir, ".clinerules"),
      content: context,
    });
  }

  return files;
}

export async function generateAgentConfigs(
  config: ProjectConfig,
  projectDir: string
): Promise<void> {
  const files = buildAgentFiles(config, projectDir);

  for (const file of files) {
    await fs.ensureDir(path.dirname(file.filePath));
    await fs.writeFile(file.filePath, file.content, "utf-8");
  }
}
