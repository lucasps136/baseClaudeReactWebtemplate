export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface ILogger {
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void;
  info(message: string, context?: string, metadata?: Record<string, any>): void;
  warn(message: string, context?: string, metadata?: Record<string, any>): void;
  error(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void;
}

export interface ILoggerConfig {
  minLevel?: LogLevel;
  enableColors?: boolean;
  enableTimestamp?: boolean;
}
