/**
 * Isolated Background Task Execution Helper
 *
 * Implements SRE-style Bulkhead Isolation for background jobs
 * (e.g. PDF generation, invoice emails, notifications).
 *
 * Features:
 * - Top-level isolation: Background failures NEVER bubble up to crash or stall main requests
 * - Strict timeout enforcement: Drops/cancels hanging background promises after max duration
 * - Resource bounding: Logs diagnostics without leaking unhandled promise rejections
 */

interface TaskOptions {
  timeoutMs?: number;
  taskName?: string;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

/**
 * Execute a background asynchronous operation in an isolated fault-tolerant boundary.
 * Returns immediately to allow the calling HTTP handler to complete its response.
 *
 * @param task The async operation to perform
 * @param options Configuration for timeout and naming
 */
export function runIsolatedTask(
  task: () => Promise<any>,
  options: TaskOptions = {}
): void {
  const {
    timeoutMs = 8_000,
    taskName = 'Anonymous Background Task',
    onSuccess,
    onError,
  } = options;

  // Execute in microtask / detached promise boundary
  (async () => {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`[Background Task Timeout] "${taskName}" exceeded ${timeoutMs}ms limit.`));
        }, timeoutMs);
        if (typeof timer.unref === 'function') {
          timer.unref(); // Prevent timer from keeping node process active unnecessarily
        }
      });

      await Promise.race([task(), timeoutPromise]);
      onSuccess?.();
    } catch (err: any) {
      console.error(`[Isolated Task Error] "${taskName}" failed:`, err?.message || err);
      onError?.(err);
    }
  })().catch((unhandledErr) => {
    // Ultimate safety net against uncaught process crash
    console.error(`[Isolated Task Critical Error] "${taskName}" uncaught:`, unhandledErr);
  });
}
