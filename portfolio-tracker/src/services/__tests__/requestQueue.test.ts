import { describe, expect, it, vi } from 'vitest';
import { RequestQueue, RequestQueueCancelledError, RequestQueueProgress } from '../requestQueue';

describe('RequestQueue', () => {
  it('processes tasks sequentially and respects order', async () => {
    const queue = new RequestQueue(0);
    const order: string[] = [];

    const firstPromise = queue.enqueue(async () => {
      order.push('first');
      return 'first-result';
    }, 'FIRST');

    const secondPromise = queue.enqueue(async () => {
      order.push('second');
      return 'second-result';
    }, 'SECOND');

    const results = await Promise.all([firstPromise, secondPromise]);

    expect(results).toEqual(['first-result', 'second-result']);
    expect(order).toEqual(['first', 'second']);
  });

  it('emits progress updates for listeners', async () => {
    const queue = new RequestQueue(0);
    const progressEvents: RequestQueueProgress[] = [];

    const dispose = queue.onProgress((progress) => {
      progressEvents.push(progress);
    });

    const task = queue.enqueue(async () => 'ok', 'TICKER');
    await task;
    dispose();

    expect(progressEvents.length).toBeGreaterThanOrEqual(2);
    expect(progressEvents.some((event) => event.currentTicker === 'TICKER')).toBe(true);
    expect(progressEvents.some((event) => event.processed > 0)).toBe(true);
  });

  it('cancels pending tasks and rejects them with a cancellation error', async () => {
    vi.useFakeTimers();
    const queue = new RequestQueue(1000);

    const first = queue.enqueue(async () => 'first', 'FIRST');
    const second = queue.enqueue(async () => 'second', 'SECOND');

    await first;
    queue.cancel();

    await expect(second).rejects.toBeInstanceOf(RequestQueueCancelledError);

    vi.useRealTimers();
  });
});
