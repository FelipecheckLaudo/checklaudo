/**
 * Secure logging utility that only logs detailed errors in development mode
 * In production, errors are hidden from console to prevent information leakage
 */
export const logger = {
  error: (message: string, error?: unknown) => {
    // Only log to console in development
    if (import.meta.env.DEV) {
      console.error(message, error);
    }
    // In production, you could send to monitoring service (Sentry, LogRocket, etc.)
    // reportToMonitoringService(message, error);
  },
  
  warn: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(message, data);
    }
  },
  
  info: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.info(message, data);
    }
  }
};
