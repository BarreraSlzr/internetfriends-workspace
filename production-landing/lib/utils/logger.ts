type LogLevel = 'info' | 'warn' | 'error'

export function log(message: string, level: LogLevel = 'info', metadata?: object) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console[level](JSON.stringify(logEntry, null, 2))
  }

  // In production, this will be captured by Vercel's logging system
  console[level](JSON.stringify(logEntry))
}

