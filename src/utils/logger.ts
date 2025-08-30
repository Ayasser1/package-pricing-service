/**
 * Native logging utility
 * Uses console-based logging with timestamps and levels
 */

export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN'
}

/**
 * Format timestamp for logging
 * @returns Formatted timestamp string
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Log a message with specified level
 * @param level - Log level (INFO, ERROR, WARN)
 * @param endpoint - API endpoint or operation context
 * @param message - Log message
 * @param error - Optional error object for stack traces
 */
const log = (level: LogLevel, endpoint: string, message: string, error?: Error): void => {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] [${endpoint}] - ${message}`;
  
  switch (level) {
    case LogLevel.INFO:
      console.log(logMessage);
      break;
    case LogLevel.WARN:
      console.warn(logMessage);
      break;
    case LogLevel.ERROR:
      console.error(logMessage);
      if (error?.stack) {
        console.error(error.stack);
      }
      break;
  }
};

export const logInfo = (endpoint: string, message: string): void => {
  log(LogLevel.INFO, endpoint, message);
};

export const logWarn = (endpoint: string, message: string): void => {
  log(LogLevel.WARN, endpoint, message);
};

export const logError = (endpoint: string, message: string, error?: Error): void => {
  log(LogLevel.ERROR, endpoint, message, error);
};
