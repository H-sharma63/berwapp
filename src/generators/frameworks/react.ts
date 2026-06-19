import { execa } from "execa";
import path from "path";

export async function generateReact(
  projectName: string,
  projectDir: string,
  features: string[]
): Promise<void> {
  const has = (f: string) => features.includes(f);

  const template = has("typescript") ? "react-ts" : "react";

  await execa(
    "npm",
    ["create", "vite@latest", projectName, "--", "--template", template],
    {
      cwd: path.dirname(projectDir),
      stdio: "pipe",
    }
  );
}
