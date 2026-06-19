import React from "react";
import { Box, Text } from "ink";

interface SuccessProps {
  projectName: string;
}

export function Success({ projectName }: SuccessProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor="green" paddingX={2}>
        <Text color="green" bold>✓ Project ready!</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Get started:</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>  <Text color="cyan">cd</Text> {projectName}</Text>
          <Text>  <Text color="cyan">npm run dev</Text></Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Happy coding! ⚡</Text>
      </Box>
    </Box>
  );
}
