import path from "path";
import fs from "fs-extra";

export async function generatePrettier(projectDir: string): Promise<void> {
  const prettierrc = `{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
`;

  const prettierignore = `.next
node_modules
dist
public
`;

  await fs.writeFile(path.join(projectDir, ".prettierrc"), prettierrc, "utf-8");
  await fs.writeFile(path.join(projectDir, ".prettierignore"), prettierignore, "utf-8");
}
