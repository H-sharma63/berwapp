import path from "path";
import fs from "fs-extra";

export async function generateDocker(
  projectName: string,
  projectDir: string
): Promise<void> {
  const dockerfile = `FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
`;

  const compose = `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${projectName}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(path.join(projectDir, "Dockerfile"), dockerfile, "utf-8");
  await fs.writeFile(path.join(projectDir, "docker-compose.yml"), compose, "utf-8");
}
