// FICHIER : app/lib/logger.server.ts
// Système de logging configurable pour la production

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "INFO";

const LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog("DEBUG")) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (shouldLog("INFO")) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (shouldLog("WARN")) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    if (shouldLog("ERROR")) {
      console.error(`❌ [ERROR] ${message}`, ...args);
    }
  },

  // Logs spécifiques pour les webhooks (toujours affichés)
  webhook: (message: string, ...args: any[]) => {
    console.log(`🔔 [WEBHOOK] ${message}`, ...args);
  },
};

export default logger;
