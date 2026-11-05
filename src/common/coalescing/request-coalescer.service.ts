import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestCoalescer {
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly generations = new Map<string, number>();

  run<T>(
    key: string,
    loader: (isCurrent: () => boolean) => Promise<T>,
  ): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing !== undefined) return existing as Promise<T>;

    const generation = this.generations.get(key) ?? 0;
    const isCurrent = () => (this.generations.get(key) ?? 0) === generation;

    const promise: Promise<T> = (async () => {
      try {
        return await loader(isCurrent);
      } finally {
        if (this.inFlight.get(key) === promise) this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  invalidate(key: string): void {
    this.inFlight.delete(key);
    this.generations.set(key, (this.generations.get(key) ?? 0) + 1);
  }
}
