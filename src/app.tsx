import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import fs from "fs-extra";
import path from "path";
import { FrameworkPicker } from "./screens/FrameworkPicker.js";
import { FeaturePicker } from "./screens/FeaturePicker.js";
import { AgentPicker } from "./screens/AgentPicker.js";
import { Preview } from "./screens/Preview.js";
import { Generating } from "./screens/Generating.js";
import { Success } from "./screens/Success.js";
import { Header } from "./components/Header.js";

type Screen = "welcome" | "framework" | "features" | "agents" | "preview" | "generating" | "success" | "error";

interface ProjectConfig {
  name: string;
  framework: string;
  features: string[];
  agents: string[];
}

interface AppProps {
  skipPrompts?: boolean;
  projectName?: string;
}

const DEFAULTS: ProjectConfig = {
  name: "my-app",
  framework: "nextjs",
  features: ["typescript", "tailwind", "eslint"],
  agents: [],
};

const TOTAL_STEPS = 5;

const STEP_MAP: Record<Screen, { step: number; name: string }> = {
  welcome:    { step: 1, name: "Welcome" },
  framework:  { step: 2, name: "Framework" },
  features:   { step: 3, name: "Features" },
  agents:     { step: 4, name: "Agents" },
  preview:    { step: 5, name: "Preview" },
  generating: { step: 5, name: "Generating" },
  success:    { step: 5, name: "Done" },
  error:      { step: 5, name: "Error" },
};

export function App({ skipPrompts = false, projectName: initialName = "" }: AppProps) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [config, setConfig] = useState<ProjectConfig>({
    ...DEFAULTS,
    name: initialName || DEFAULTS.name,
  });
  const [projectName, setProjectName] = useState(initialName);
  const [nameError, setNameError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (skipPrompts) {
      // --yes: skip all screens, generate with defaults
      const name = initialName || DEFAULTS.name;
      const targetPath = path.join(process.cwd(), name);
      if (fs.existsSync(targetPath)) {
        setErrorMessage(`Folder '${name}' already exists. Use a different name with --name <name>.`);
        setScreen("error");
        return;
      }
      setConfig({ ...DEFAULTS, name });
      setScreen("generating");
    } else if (initialName) {
      // --name without --yes: pre-fill name, skip welcome screen
      const targetPath = path.join(process.cwd(), initialName);
      if (fs.existsSync(targetPath)) {
        setNameError(`Folder '${initialName}' already exists. Choose a different name.`);
      } else {
        setConfig((prev) => ({ ...prev, name: initialName }));
        setScreen("framework");
      }
    }
  }, []);

  function handleNameSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setNameError("Project name cannot be empty.");
      return;
    }
    if (!/^[a-z0-9]([a-z0-9-_]*[a-z0-9])?$/.test(trimmed)) {
      setNameError("Use lowercase letters, numbers, hyphens, underscores only.");
      return;
    }
    const targetPath = path.join(process.cwd(), trimmed);
    if (fs.existsSync(targetPath)) {
      setNameError(`Folder '${trimmed}' already exists. Choose a different name.`);
      return;
    }
    try {
      fs.accessSync(process.cwd(), fs.constants.W_OK);
    } catch {
      setNameError("No write permission in current directory. Try a different location.");
      return;
    }
    setNameError("");
    setConfig((prev) => ({ ...prev, name: trimmed }));
    setScreen("framework");
  }

  function handleFrameworkSelect(framework: string) {
    setConfig((prev) => ({ ...prev, framework }));
    setScreen("features");
  }

  function handleFeaturesSubmit(features: string[], wantsAgents: boolean) {
    setConfig((prev) => ({ ...prev, features }));
    setScreen(wantsAgents ? "agents" : "preview");
  }

  function handleAgentsSubmit(agents: string[]) {
    setConfig((prev) => ({ ...prev, agents }));
    setScreen("preview");
  }

  function handleConfirm() {
    setScreen("generating");
  }

  const { step, name: stepName } = STEP_MAP[screen];

  if (screen === "welcome") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header step={step} totalSteps={TOTAL_STEPS} stepName={stepName} />
        <Box flexDirection="column">
          <Text bold>Project name:</Text>
          <Box marginTop={1}>
            <Text color="cyan">❯ </Text>
            <TextInput
              value={projectName}
              onChange={(val) => {
                setProjectName(val);
                if (nameError) setNameError("");
              }}
              onSubmit={handleNameSubmit}
              placeholder="my-app"
            />
          </Box>
          {nameError ? (
            <Box marginTop={1}>
              <Text color="red">✖ {nameError}</Text>
            </Box>
          ) : (
            <Box marginTop={1}>
              <Text dimColor>lowercase, hyphens and underscores allowed · enter to continue</Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  if (screen === "framework") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header step={step} totalSteps={TOTAL_STEPS} stepName={stepName} />
        <FrameworkPicker onSelect={handleFrameworkSelect} />
      </Box>
    );
  }

  if (screen === "features") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header step={step} totalSteps={TOTAL_STEPS} stepName={stepName} />
        <FeaturePicker framework={config.framework} onSubmit={handleFeaturesSubmit} />
      </Box>
    );
  }

  if (screen === "agents") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header step={step} totalSteps={TOTAL_STEPS} stepName={stepName} />
        <AgentPicker onSubmit={handleAgentsSubmit} />
      </Box>
    );
  }

  if (screen === "preview") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header step={step} totalSteps={TOTAL_STEPS} stepName={stepName} />
        <Preview config={config} onConfirm={handleConfirm} />
      </Box>
    );
  }

  if (screen === "generating") {
    return (
      <Generating
        config={config}
        onDone={() => setScreen("success")}
        onError={(err) => {
          setErrorMessage(err);
          setScreen("error");
        }}
      />
    );
  }

  if (screen === "success") {
    return <Success projectName={config.name} />;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="red" bold>✖ Something went wrong</Text>
      <Box marginTop={1}>
        <Text dimColor>{errorMessage}</Text>
      </Box>
    </Box>
  );
}
