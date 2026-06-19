import path from "path";
import fs from "fs-extra";

export async function generateVSCode(
  projectDir: string,
  features: string[]
): Promise<void> {
  const has = (f: string) => features.includes(f);

  const settings: Record<string, unknown> = {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
    },
    "typescript.tsdk": "node_modules/typescript/lib",
  };

  if (has("tailwind")) {
    settings["tailwindCSS.experimental.classRegex"] = [
      ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ];
  }

  const recommendations = ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"];
  if (has("tailwind")) recommendations.push("bradlc.vscode-tailwindcss");
  if (has("prisma")) recommendations.push("prisma.prisma");

  await fs.ensureDir(path.join(projectDir, ".vscode"));
  await fs.writeFile(
    path.join(projectDir, ".vscode", "settings.json"),
    JSON.stringify(settings, null, 2) + "\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(projectDir, ".vscode", "extensions.json"),
    JSON.stringify({ recommendations }, null, 2) + "\n",
    "utf-8"
  );
}
