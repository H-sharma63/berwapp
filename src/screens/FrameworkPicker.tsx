import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

interface FrameworkPickerProps {
  onSelect: (framework: string) => void;
}

const frameworks = [
  { label: "Next.js (App Router)", value: "nextjs" },
  { label: "React + Vite", value: "react" },
  { label: "Node.js + Express", value: "express" }
];

function ItemComponent({ isSelected, label }: { isSelected?: boolean; label: string }) {
  const isDisabled = label.includes("coming soon");
  if (isDisabled) return <Text dimColor>{label}</Text>;
  return <Text color={isSelected ? "cyan" : "white"} bold={isSelected}>{label}</Text>;
}

function IndicatorComponent({ isSelected }: { isSelected?: boolean }) {
  return <Text color="cyan">{isSelected ? "❯ " : "  "}</Text>;
}

export function FrameworkPicker({ onSelect }: FrameworkPickerProps) {
  function handleSelect(item: { label: string; value: string }) {
    if (!item.label.includes("coming soon")) {
      onSelect(item.value);
    }
  }

  return (
    <Box flexDirection="column">
      <Text bold>Pick a framework:</Text>
      <Box marginTop={1} flexDirection="column">
        <SelectInput
          items={frameworks}
          onSelect={handleSelect}
          itemComponent={ItemComponent}
          indicatorComponent={IndicatorComponent}
        />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>up/down navigate · enter to select · grey = coming soon</Text>
      </Box>
    </Box>
  );
}
