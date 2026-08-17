import babel from "@rolldown/plugin-babel";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";


export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    babel({}),
  ],
  test: {
    environment: "jsdom",
    execArgv: ["--localstorage-file=.localstorage.json"],
    globals: true,
    include: ["src/**/__tests__/**/*.spec.{ts,tsx}"],
    outputFile: {
      agent: "test-results/vitest/agent-results.json",
    },
    setupFiles: ["./vitest.setup.ts"],
    silent: true,
  },
});
