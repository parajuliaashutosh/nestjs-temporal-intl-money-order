import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

// Define the injection token
export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClientType> => {
        const client = createClient({
          url: configService.getOrThrow<string>('REDIS_URL'),
        });

        // client.on('error', (err) => {
        //   console.error('Redis Client Error', err);
        // });

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}