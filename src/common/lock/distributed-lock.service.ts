import { CACHE_CLIENT } from '@/src/modules/cache/cache.constant';
import { Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class DistributedLockService {
  constructor(
    @Inject(CACHE_CLIENT)
    private readonly cacheClient: ReturnType<typeof createClient>,
  ) {}

  public async acquire(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.cacheClient.set(key, '1', {
      NX: true,
      PX: ttlMs,
    });
    return result === 'OK';
  }
}
