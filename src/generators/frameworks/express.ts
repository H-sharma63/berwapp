import path from "path";
import fs from "fs-extra";

export async function generateExpress(
  projectName: string,
  projectDir: string,
  features: string[]
): Promise<void> {
  const has = (f: string) => features.includes(f);
  const ts = has("typescript");

  // package.json
  const deps: Record<string, string> = {
    express: "^4.21.0",
  };
  if (has("cors")) {
    deps["cors"] = "^2.8.5";
    deps["helmet"] = "^8.0.0";
  }
  if (has("prisma")) deps["@prisma/client"] = "^6.0.0";
  if (has("jwt")) {
    deps["jsonwebtoken"] = "^9.0.0";
    deps["bcryptjs"] = "^2.4.3";
  }
  if (has("swagger")) {
    deps["swagger-ui-express"] = "^5.0.0";
    deps["swagger-jsdoc"] = "^6.2.8";
  }

  const devDeps: Record<string, string> = {};
  if (ts) {
    devDeps["typescript"] = "^5.0.0";
    devDeps["ts-node"] = "^10.9.0";
    devDeps["tsup"] = "^8.0.0";
    devDeps["@types/express"] = "^5.0.0";
    devDeps["@types/node"] = "^22.0.0";
    if (has("cors")) {
      devDeps["@types/cors"] = "^2.8.17";
    }
    if (has("jwt")) {
      devDeps["@types/jsonwebtoken"] = "^9.0.0";
      devDeps["@types/bcryptjs"] = "^2.4.6";
    }
    if (has("swagger")) devDeps["@types/swagger-ui-express"] = "^4.1.8";
  }
  if (has("prisma")) devDeps["prisma"] = "^6.0.0";

  const pkg = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: ts
      ? {
          dev: "ts-node src/index.ts",
          build: "tsup src/index.ts --format cjs --out-dir dist",
          start: "node dist/index.js",
          lint: "eslint .",
        }
      : {
          dev: "node src/index.js",
          start: "node src/index.js",
          lint: "eslint .",
        },
    dependencies: deps,
    devDependencies: devDeps,
  };

  // Main entry file
  const ext = ts ? "ts" : "js";
  const indexContent = `import express from "express";
${has("cors") ? `import cors from "cors";\nimport helmet from "helmet";` : ""}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
${has("cors") ? "app.use(cors());\napp.use(helmet());" : ""}

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

  const tsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "commonjs",
      lib: ["ES2022"],
      outDir: "dist",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
    },
    include: ["src"],
    exclude: ["node_modules", "dist"],
  };

  // Write files
  await fs.ensureDir(path.join(projectDir, "src", "routes"));
  await fs.ensureDir(path.join(projectDir, "src", "middleware"));

  await fs.writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(projectDir, "src", `index.${ext}`),
    indexContent,
    "utf-8"
  );

  if (ts) {
    await fs.writeFile(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2) + "\n",
      "utf-8"
    );
  }

  // .gitignore
  const gitignore = `node_modules
dist
.env
.env.local
`;
  await fs.writeFile(path.join(projectDir, ".gitignore"), gitignore, "utf-8");
}
