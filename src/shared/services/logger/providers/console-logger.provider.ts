import type {
  ILogger,
  LogLevel,
  /* ILogEntry, */ ILoggerConfig,
} from "../logger.types";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m", // Gray
  info: "\x1b[34m", // Blue
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
};

const RESET_COLOR = "\x1b[0m";
const BOLD = "\x1b[1m";

export class ConsoleLoggerProvider implements ILogger {
  private minLevel: LogLevel;
  private enableColors: boolean;
  private enableTimestamp: boolean;

  constructor(config: ILoggerConfig = {}) {
    this.minLevel = config.minLevel || "debug";
    this.enableColors = config.enableColors ?? true;
    this.enableTimestamp = config.enableTimestamp ?? true;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private colorize(text: string, color: string): string {
    if (!this.enableColors) return text;
    return `${color}${text}${RESET_COLOR}`;
  }

  private formatLevel(level: LogLevel): string {
    const levelText = level.toUpperCase().padEnd(5);
    return this.colorize(levelText, LEVEL_COLORS[level]);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
  ): string {
    let formatted = "";

    if (this.enableTimestamp) {
      const timestamp = this.formatTimestamp();
      formatted += this.colorize(timestamp, "\x1b[90m") + " ";
    }

    formatted += `[${this.formatLevel(level)}]`;

    if (context) {
      formatted += ` ${this.colorize(`[${context}]`, BOLD)}`;
    }

    formatted += ` ${message}`;

    return formatted;
  }

  private formatMetadata(metadata?: Record<string, unknown>): string {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "";
    }

    try {
      return "\n" + JSON.stringify(metadata, null, 2);
    } catch (error) {
      return "\n[Unable to stringify metadata]";
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);
    const formattedMetadata = this.formatMetadata(metadata);

    const output = formattedMessage + formattedMetadata;

    switch (level) {
      case "debug":
      case "info":
        console.log(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
    }
  }

  debug(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log("debug", message, context, metadata);
  }

  info(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log("info", message, context, metadata);
  }

  warn(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log("warn", message, context, metadata);
  }

  error(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log("error", message, context, metadata);
  }
}
