import { execa } from "execa";
import path from "path";

export async function generateNextjs(
  projectName: string,
  projectDir: string,
  features: string[]
): Promise<void> {
  const has = (f: string) => features.includes(f);

  const args = [
    "create-next-app@latest",
    projectName,
    "--app",
    "--no-git",
    "--no-install",
    has("typescript") ? "--typescript" : "--js",
    has("tailwind") ? "--tailwind" : "--no-tailwind",
    has("eslint") ? "--eslint" : "--no-eslint",
    "--src-dir",
    "--import-alias",
    "@/*",
  ];

  await execa("npx", args, {
    cwd: path.dirname(projectDir),
    stdio: "pipe",
  });
}
