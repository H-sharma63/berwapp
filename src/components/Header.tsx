import React from "react";
import { Box, Text } from "ink";

interface HeaderProps {
  step: number;
  totalSteps: number;
  stepName: string;
}

const stepNames = ["Welcome", "Framework", "Features", "Agents", "Preview"];

export function Header({ step, totalSteps }: HeaderProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box justifyContent="space-between">
        <Text color="cyan" bold>⚡ berwapp</Text>
        <Text dimColor>step {step}/{totalSteps}</Text>
      </Box>

      <Box marginTop={1} gap={1}>
        {stepNames.map((name, i) => {
          const num = i + 1;
          const isDone = num < step;
          const isActive = num === step;
          return (
            <Box key={name} gap={1}>
              <Text
                color={isDone ? "green" : isActive ? "cyan" : undefined}
                dimColor={!isDone && !isActive}
                bold={isActive}
              >
                {isDone ? `✓ ${name}` : isActive ? `[${name}]` : name}
              </Text>
              {i < stepNames.length - 1 && (
                <Text dimColor>›</Text>
              )}
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>{"─".repeat(44)}</Text>
      </Box>
    </Box>
  );
}
