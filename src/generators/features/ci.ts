import path from "path";
import fs from "fs-extra";

export async function generateCI(projectDir: string): Promise<void> {
  const workflow = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
`;

  await fs.ensureDir(path.join(projectDir, ".github", "workflows"));
  await fs.writeFile(
    path.join(projectDir, ".github", "workflows", "ci.yml"),
    workflow,
    "utf-8"
  );
}
