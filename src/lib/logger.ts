import { Logger } from "tslog";

// Create a tslog logger instance
const tsLogger = new Logger({
  name: "AppLogger",
  // Don't use `env` here, because we can use the logger in the browser
  minLevel: process.env.NODE_ENV === "production" ? 3 : 0,
});

export const logger = {
  info: (message: string, meta?: unknown) => {
    tsLogger.info(message, meta);
    console.log(`[INFO] ${message}`, meta);
  },
  error: (message: string, error: unknown) => {
    tsLogger.error(message, error);
    console.error(`[ERROR] ${message}`, error);
  },
};