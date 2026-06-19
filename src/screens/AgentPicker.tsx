import React, { useState } from "react";
import { Box, Text, useInput, useStdout } from "ink";

interface AgentPickerProps {
  onSubmit: (agents: string[]) => void;
}

const agents = [
  { label: "Claude Code", hint: ".claude/CLAUDE.md", value: "claude", default: true },
  { label: "Gemini CLI", hint: "GEMINI.md", value: "gemini", default: false },
  { label: "GitHub Copilot", hint: ".github/copilot-instructions.md", value: "copilot", default: false },
  { label: "Cursor", hint: ".cursor/rules", value: "cursor", default: false },
  { label: "Windsurf", hint: ".windsurfrules", value: "windsurf", default: false },
  { label: "Cline", hint: ".clinerules", value: "cline", default: false },
  { label: "OpenCode", hint: "AGENTS.md", value: "opencode", default: true },
  { label: "Codex CLI", hint: "AGENTS.md (shared with OpenCode)", value: "codex", default: false },
];

export function AgentPicker({ onSubmit }: AgentPickerProps) {
  const { stdout } = useStdout();
  const terminalHeight = stdout?.rows ?? 24;
  const VISIBLE = Math.max(3, terminalHeight - 10);

  const totalItems = agents.length + 1;
  const [cursor, setCursor] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(agents.filter((a) => a.default).map((a) => a.value))
  );

  const onButton = cursor === agents.length;

  useInput((_input, key) => {
    if (key.upArrow) {
      const next = cursor > 0 ? cursor - 1 : totalItems - 1;
      setCursor(next);
      if (next < scrollOffset) setScrollOffset(next);
      if (next === totalItems - 1) setScrollOffset(Math.max(0, agents.length - VISIBLE + 1));
    }
    if (key.downArrow) {
      const next = cursor < totalItems - 1 ? cursor + 1 : 0;
      setCursor(next);
      if (next > scrollOffset + VISIBLE - 1) setScrollOffset(next - VISIBLE + 1);
      if (next === 0) setScrollOffset(0);
    }
    if (key.return) {
      if (onButton) {
        onSubmit(Array.from(selected));
      } else {
        setSelected((prev) => {
          const next = new Set(prev);
          const value = agents[cursor].value;
          next.has(value) ? next.delete(value) : next.add(value);
          return next;
        });
      }
    }
  });

  const visibleAgents = agents.slice(scrollOffset, scrollOffset + VISIBLE);
  const showScrollUp = scrollOffset > 0;
  const showScrollDown = scrollOffset + VISIBLE < agents.length;

  return (
    <Box flexDirection="column">
      <Text bold>Select AI agents: <Text dimColor>(you can pick multiple)</Text></Text>
      <Box marginTop={1} flexDirection="column">
        {showScrollUp && <Text dimColor>  ↑ more above</Text>}
        {visibleAgents.map((agent, i) => {
          const realIndex = scrollOffset + i;
          const isActive = cursor === realIndex;
          const isChecked = selected.has(agent.value);

          return (
            <Box key={agent.value}>
              <Text color="cyan">{isActive ? "❯ " : "  "}</Text>
              <Text color={isChecked ? "green" : "white"}>
                {isChecked ? "[+]" : "[ ]"} {agent.label}
              </Text>
              <Text dimColor>  {agent.hint}</Text>
              {agent.default && !isChecked && (
                <Text dimColor> (recommended)</Text>
              )}
            </Box>
          );
        })}
        {showScrollDown && <Text dimColor>  ↓ more below</Text>}
      </Box>

      <Box marginTop={1}>
        <Text color="cyan">{onButton ? "❯ " : "  "}</Text>
        <Text color={onButton ? "cyan" : "white"} bold={onButton} inverse={onButton}>
          {" "}Continue{" "}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>↑/↓ navigate · enter to toggle · go to Continue when ready</Text>
      </Box>
    </Box>
  );
}
