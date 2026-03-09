import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'DM Sans', system-ui, sans-serif" },
        body: { value: "'DM Sans', system-ui, sans-serif" },
      },
      styles: {
        global: {
          body: {
            bg: { value: "gray.900" },
            color: { value: "whiteAlpha.900" },
          },
        },
      },
    },
  },
});

export default theme;
