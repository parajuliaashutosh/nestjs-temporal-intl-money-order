import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { CACHE_CLIENT } from './cache.constant';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.getOrThrow<string>('REDIS_URL'),
        });

        client.on('error', (err) => {
          console.error('Redis Client Error', err);
        });

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_CLIENT],
})
export class CacheModule implements OnModuleDestroy {
    constructor(
    @Inject(CACHE_CLIENT) private readonly client: ReturnType<typeof createClient>,
  ) {}

  async onModuleDestroy() {
    await this.client.quit();
  }
}