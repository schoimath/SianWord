import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/SianWord/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
