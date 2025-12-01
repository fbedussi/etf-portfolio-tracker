import { ALPHA_VANTAGE_CONFIG } from '@/config/api.config';

export interface RequestQueueProgress {
  total: number;
  processed: number;
  queueLength: number;
  currentTicker?: string;
}

export class RequestQueueCancelledError extends Error {
  constructor(message = 'Request queue cancelled') {
    super(message);
    this.name = 'RequestQueueCancelledError';
  }
}

type QueueTask<T> = {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  ticker?: string;
};

export class RequestQueue {
  private queue: QueueTask<unknown>[] = [];
  private listeners = new Set<(progress: RequestQueueProgress) => void>();
  private running = false;
  private cancelRequested = false;
  private currentTicker: string | undefined;
  private batchProcessed = 0;
  private batchTotal = 0;

  constructor(private readonly delayMs = 12000) {}

  enqueue<T>(executor: () => Promise<T>, ticker?: string): Promise<T> {
    this.batchTotal += 1;

    return new Promise<T>((resolve, reject) => {
      this.queue.push({ execute: executor, resolve, reject, ticker });
      this.emitProgress();
      this.processQueue();
    });
  }

  onProgress(listener: (progress: RequestQueueProgress) => void): () => void {
    this.listeners.add(listener);
    listener(this.buildProgress());
    return () => this.listeners.delete(listener);
  }

  cancel() {
    this.cancelRequested = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      task?.reject(new RequestQueueCancelledError());
    }

    this.emitProgress();
    if (!this.running) {
      this.cancelRequested = false;
      this.resetBatch();
    }
  }

  private async processQueue() {
    if (this.running) {
      return;
    }

    this.running = true;

    while (this.queue.length > 0 && !this.cancelRequested) {
      const task = this.queue.shift()!;
      this.currentTicker = task.ticker;
      this.emitProgress();

      try {
        const result = await task.execute();
        this.batchProcessed += 1;
        task.resolve(result);
      } catch (error) {
        this.batchProcessed += 1;
        task.reject(error);
      }

      this.currentTicker = undefined;

      if (this.delayMs > 0 && this.queue.length > 0 && !this.cancelRequested) {
        await this.delay(this.delayMs);
      }
    }

    this.running = false;
    this.currentTicker = undefined;
    this.emitProgress();

    if (!this.cancelRequested) {
      this.resetBatch();
    } else {
      this.cancelRequested = false;
      this.resetBatch();
    }
  }

  private emitProgress() {
    const progress = this.buildProgress();
    this.listeners.forEach((listener) => listener(progress));
  }

  private buildProgress(): RequestQueueProgress {
    return {
      total: this.batchTotal,
      processed: this.batchProcessed,
      queueLength: this.queue.length,
      currentTicker: this.currentTicker,
    };
  }

  private resetBatch() {
    this.batchProcessed = 0;
    this.batchTotal = 0;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const priceRequestQueue = new RequestQueue(
  Math.ceil(60000 / ALPHA_VANTAGE_CONFIG.rateLimit.callsPerMinute)
);
