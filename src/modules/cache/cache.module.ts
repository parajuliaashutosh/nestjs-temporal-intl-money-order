import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { DistributedLockService } from '../../common/lock/distributed-lock.service';
import { CACHE_CLIENT } from './cache.constant';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DistributedLockService,
    {
      provide: CACHE_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          socket: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),
          },
          username: configService.getOrThrow<string>('REDIS_USERNAME'),
          password: configService.getOrThrow<string>('REDIS_PASSWORD'),
          database: configService.getOrThrow<number>('REDIS_DB'),
        });

        client.on('error', (err) => {
          Logger.error('Redis Client Error', err);
        });

        await client.connect();
        Logger.log('Connected to Redis');
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_CLIENT, DistributedLockService],
})
export class CacheModule implements OnModuleDestroy {
  constructor(
    @Inject(CACHE_CLIENT)
    private readonly client: ReturnType<typeof createClient>,
  ) {}

  async onModuleDestroy() {
    await this.client.quit();
  }
}
