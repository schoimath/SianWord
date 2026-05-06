import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

function makeBuildVersion(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `0.1.${get("year")}${get("month")}${get("day")}.${get("hour")}${get("minute")}`;
}

export default defineConfig({
  base: "/SianWord/",
  define: {
    __APP_VERSION__: JSON.stringify(makeBuildVersion()),
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
