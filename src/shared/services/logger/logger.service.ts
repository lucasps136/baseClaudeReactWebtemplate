import type { ILogger, ILoggerConfig, LogLevel } from "./logger.types";
import { ConsoleLoggerProvider } from "./providers/console-logger.provider";

let loggerInstance: ILogger | null = null;

export function createLogger(config?: ILoggerConfig): ILogger {
  const defaultConfig: ILoggerConfig = {
    minLevel: getDefaultMinLevel(),
    enableColors: true,
    enableTimestamp: true,
    ...config,
  };

  return new ConsoleLoggerProvider(defaultConfig);
}

function getDefaultMinLevel(): LogLevel {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return "warn";
    case "test":
      return "error";
    default:
      return "debug";
  }
}

export function getLogger(): ILogger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}

export const logger = getLogger();
