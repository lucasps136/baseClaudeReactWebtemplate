export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ILogger {
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void;
  info(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void;
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void;
  error(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void;
}

export interface ILoggerConfig {
  minLevel?: LogLevel;
  enableColors?: boolean;
  enableTimestamp?: boolean;
}
