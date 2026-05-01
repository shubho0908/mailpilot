import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  }),
  ...(isProduction && {
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  }),
});

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(message: string, meta?: Record<string, unknown>): Record<string, unknown> {
    return {
      message,
      context: this.context,
      ...meta,
    };
  }

  info(message: string, meta?: Record<string, unknown>): void {
    logger.info(this.formatMessage(message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    logger.error(
      this.formatMessage(message, {
        ...meta,
        ...(error instanceof Error && {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }),
      })
    );
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(this.formatMessage(message, meta));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(this.formatMessage(message, meta));
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
