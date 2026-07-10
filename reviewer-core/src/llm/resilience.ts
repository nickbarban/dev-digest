/**
 * Guaranteed timeout for a promise via `Promise.race` — rejects at `ms`
 * regardless of whether the underlying operation (e.g. an SDK's own internal
 * AbortController-based timeout) ever actually settles. Needed because the
 * OpenAI SDK's `timeout` option is not always honored when the upstream
 * response body stalls mid-stream (observed: a request hanging ~25 minutes
 * past its configured 90s timeout before undici's own socket timeout fired).
 *
 * reviewer-core cannot depend on server/src/platform/resilience.ts (this
 * package has no dependency on the server — it's also run standalone by the
 * CI runner), so this is a small local copy of the same primitive.
 */
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  if (!ms || ms <= 0) return p;
  let handle: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    handle = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(handle!);
  }
}
