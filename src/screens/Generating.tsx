import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { generateProject } from "../generators/index.js";

interface GeneratingProps {
  config: {
    name: string;
    framework: string;
    features: string[];
    agents: string[];
  };
  onDone: () => void;
  onError: (err: string) => void;
}

interface Step {
  message: string;
  status: "pending" | "running" | "done";
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Generating({ config, onDone, onError }: GeneratingProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cwd = process.cwd();

    generateProject(config, cwd, (message) => {
      setCurrentStep(message);
      setSteps((prev) => {
        const updated = prev.map((s) =>
          s.status === "running" ? { ...s, status: "done" as const } : s
        );
        return [...updated, { message, status: "running" }];
      });
    })
      .then(() => {
        setSteps((prev) =>
          prev.map((s) => (s.status === "running" ? { ...s, status: "done" } : s))
        );
        onDone();
      })
      .catch((err: Error) => {
        onError(err.message);
      });
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan" bold>⚡ Creating {config.name}...</Text>

      <Box marginTop={1} flexDirection="column">
        {steps.map((step, i) => (
          <Box key={i}>
            {step.status === "done" ? (
              <Text color="green">✓ {step.message}</Text>
            ) : (
              <Text color="cyan">{SPINNER_FRAMES[spinnerFrame]} {step.message}</Text>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
