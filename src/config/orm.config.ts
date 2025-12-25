import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import path from 'path';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/browser';
import { AppDataSource } from '../common/provider/datasource.provider';
import { initializeTransactionalContext } from '../common/transaction/patch-typeorm';

export default class TypeOrmConfig {
  static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: configService.get<string>('DATABASE_HOST') || 'localhost',
      port: configService.get<number>('DATABASE_PORT') || 5432,
      username: configService.get<string>('DATABASE_USERNAME'),
      password: configService.get<string>('DATABASE_PASSWORD'),
      database: configService.get<string>('DATABASE_NAME'),
      entities: [path.join(__dirname, '..', '**', '*.entity.{js,ts}')],
      synchronize: configService.get<string>('NODE_ENV') !== 'PRODUCTION',
    };
  }
}

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    // return TypeOrmConfig.getOrmConfig(configService);
    const options: TypeOrmModuleOptions = TypeOrmConfig.getOrmConfig(configService);

    initializeTransactionalContext();
    return options;
  },
  inject: [ConfigService],
  dataSourceFactory: async (options) => {
    const dataSource = new DataSource(options as DataSourceOptions);
    await dataSource.initialize();
    AppDataSource.dataSource = dataSource; // Store NestJS's DataSource
    return dataSource;
  },
};
