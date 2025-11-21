/**
 * Test Logger Configuration
 * Suppresses non-critical logs during test execution to reduce noise
 */

// Store original console methods
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Patterns to suppress
const SUPPRESS_PATTERNS = [
  /Incoming HTTP request/,
  /HTTP request completed/,
  /User (login|registration)/,
  /User login (attempt|successful)/,
  /Failed to fetch content/,
  /Job .* failed/,
  /Content fetch failed/,
  /\[Nest\]/,
  /executeQuery/,
]

/**
 * Check if a message should be suppressed
 */
function shouldSuppress(message: string): boolean {
  return SUPPRESS_PATTERNS.some((pattern) => pattern.test(message))
}

/**
 * Filter console.log to suppress noise
 */
console.log = (...args: any[]) => {
  const message = args.join(' ')
  if (!shouldSuppress(message)) {
    originalConsoleLog.apply(console, args)
  }
}

/**
 * Filter console.error to only show test-relevant errors
 */
console.error = (...args: any[]) => {
  const message = args.join(' ')
  // Only suppress specific error patterns, keep test assertion errors
  if (
    !message.includes('ContentProcessorService') &&
    !message.includes('EventBusService') &&
    !message.includes('Query failed: INSERT')
  ) {
    originalConsoleError.apply(console, args)
  }
}

/**
 * Filter console.warn
 */
console.warn = (...args: any[]) => {
  const message = args.join(' ')
  if (!shouldSuppress(message)) {
    originalConsoleWarn.apply(console, args)
  }
}

// Export for potential restoration in specific tests
export const restoreConsole = () => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
}
