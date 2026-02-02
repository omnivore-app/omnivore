export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs?: number;
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === options.maxAttempts) break;
      await sleepMs(backoffDelayMs(attempt, options.baseDelayMs ?? 500));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function backoffDelayMs(attempt: number, baseDelayMs: number): number {
  return 2 ** attempt * baseDelayMs;
}

function sleepMs(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

