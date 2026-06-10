import type { ApiResponse } from '../api';

expect.extend({
  toRespondWithin(received: ApiResponse<unknown>, thresholdMs: number) {
    const pass = received.durationMs <= thresholdMs;
    return {
      pass,
      message: () =>
        pass
          ? `Expected response NOT to complete within ${thresholdMs}ms, but it took ${received.durationMs}ms`
          : `Expected response to complete within ${thresholdMs}ms, but it took ${received.durationMs}ms`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toRespondWithin(thresholdMs: number): R;
    }
  }
}

export {};
