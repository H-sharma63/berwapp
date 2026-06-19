import React, { useState } from "react";
import { Box, Text, useInput, useStdout } from "ink";

interface Feature {
  label: string;
  value: string;
  default: boolean;
  separator?: boolean;
}

interface FeaturePickerProps {
  framework: string;
  onSubmit: (features: string[], wantsAgents: boolean) => void;
}

const NEXTJS_FEATURES: Feature[] = [
  { label: "TypeScript", value: "typescript", default: true },
  { label: "Tailwind CSS", value: "tailwind", default: true },
  { label: "ESLint + Prettier", value: "eslint", default: true },
  { label: "shadcn/ui components", value: "shadcn", default: false },
  { label: "Authentication (NextAuth)", value: "auth", default: false },
  { label: "Database (Prisma + PostgreSQL)", value: "prisma", default: false },
  { label: "Docker setup", value: "docker", default: false },
  { label: "GitHub Actions CI/CD", value: "ci", default: false },
  { label: "Setup AI agent config", value: "agents", default: false, separator: true },
];

const REACT_FEATURES: Feature[] = [
  { label: "TypeScript", value: "typescript", default: true },
  { label: "Tailwind CSS", value: "tailwind", default: true },
  { label: "ESLint + Prettier", value: "eslint", default: true },
  { label: "React Router v6", value: "router", default: true },
  { label: "shadcn/ui components", value: "shadcn", default: false },
  { label: "Docker setup", value: "docker", default: false },
  { label: "GitHub Actions CI/CD", value: "ci", default: false },
  { label: "Setup AI agent config", value: "agents", default: false, separator: true },
];

const EXPRESS_FEATURES: Feature[] = [
  { label: "TypeScript", value: "typescript", default: true },
  { label: "ESLint + Prettier", value: "eslint", default: true },
  { label: "CORS + Helmet (security)", value: "cors", default: true },
  { label: "Database (Prisma + PostgreSQL)", value: "prisma", default: false },
  { label: "JWT Authentication", value: "jwt", default: false },
  { label: "Swagger API docs", value: "swagger", default: false },
  { label: "Docker setup", value: "docker", default: false },
  { label: "GitHub Actions CI/CD", value: "ci", default: false },
  { label: "Setup AI agent config", value: "agents", default: false, separator: true },
];

const FEATURE_MAP: Record<string, Feature[]> = {
  nextjs: NEXTJS_FEATURES,
  react: REACT_FEATURES,
  express: EXPRESS_FEATURES,
};

export function FeaturePicker({ framework, onSubmit }: FeaturePickerProps) {
  const features = FEATURE_MAP[framework] ?? NEXTJS_FEATURES;

  const { stdout } = useStdout();
  const terminalHeight = stdout?.rows ?? 24;
  const VISIBLE = Math.max(3, terminalHeight - 10);

  const totalItems = features.length + 1;
  const [cursor, setCursor] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(features.filter((f) => f.default).map((f) => f.value))
  );
  const [warning, setWarning] = useState("");

  const onButton = cursor === features.length;

  useInput((_input, key) => {
    if (key.upArrow) {
      const next = cursor > 0 ? cursor - 1 : totalItems - 1;
      setCursor(next);
      if (next < scrollOffset) setScrollOffset(next);
      if (next === totalItems - 1) setScrollOffset(Math.max(0, features.length - VISIBLE + 1));
    }
    if (key.downArrow) {
      const next = cursor < totalItems - 1 ? cursor + 1 : 0;
      setCursor(next);
      if (next > scrollOffset + VISIBLE - 1) setScrollOffset(next - VISIBLE + 1);
      if (next === 0) setScrollOffset(0);
    }
    if (key.return) {
      if (onButton) {
        const wantsAgents = selected.has("agents");
        const featureList = Array.from(selected).filter((f) => f !== "agents");
        onSubmit(featureList, wantsAgents);
      } else {
        setSelected((prev) => {
          const next = new Set(prev);
          const value = features[cursor].value;
          next.has(value) ? next.delete(value) : next.add(value);
          setWarning("");
          if (value === "auth" && next.has("auth") && !next.has("prisma")) {
            next.add("prisma");
            setWarning("NextAuth requires a database - Prisma auto-selected");
          }
          if (value === "shadcn" && next.has("shadcn") && !next.has("tailwind")) {
            next.add("tailwind");
            setWarning("shadcn/ui requires Tailwind - auto-selected");
          }
          return next;
        });
      }
    }
  });

  const visibleFeatures = features.slice(scrollOffset, scrollOffset + VISIBLE);
  const showScrollUp = scrollOffset > 0;
  const showScrollDown = scrollOffset + VISIBLE < features.length;

  return (
    <Box flexDirection="column">
      <Text bold>Select features:</Text>
      <Box marginTop={1} flexDirection="column">
        {showScrollUp && <Text dimColor>  up more above</Text>}
        {visibleFeatures.map((feature, i) => {
          const realIndex = scrollOffset + i;
          const isActive = cursor === realIndex;
          const isChecked = selected.has(feature.value);

          return (
            <Box key={feature.value} flexDirection="column">
              {feature.separator && (
                <Box marginY={1}>
                  <Text dimColor>{"─".repeat(36)}</Text>
                </Box>
              )}
              <Box>
                <Text color="cyan">{isActive ? "❯ " : "  "}</Text>
                <Text color={isChecked ? "green" : "white"}>
                  {isChecked ? "[+]" : "[ ]"} {feature.label}
                </Text>
                {feature.default && !isChecked && (
                  <Text dimColor> (recommended)</Text>
                )}
              </Box>
            </Box>
          );
        })}
        {showScrollDown && <Text dimColor>  down more below</Text>}
      </Box>

      <Box marginTop={1}>
        <Text color="cyan">{onButton ? "❯ " : "  "}</Text>
        <Text color={onButton ? "cyan" : "white"} bold={onButton} inverse={onButton}>
          {" "}Continue{" "}
        </Text>
      </Box>

      {warning && (
        <Box marginTop={1}>
          <Text color="yellow">! {warning}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>up/down navigate · enter to toggle · go to Continue when ready</Text>
      </Box>
    </Box>
  );
}
