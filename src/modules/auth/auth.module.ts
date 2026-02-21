// auth.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_REPO, AUTH_SERVICE } from './auth.constant';
import { Auth } from './entity/auth.entity';
import { AuthController } from './gateway/rest/auth.controller';
import { AuthRepo } from './repo/auth.repo';
import { AuthService } from './service/auth.service';
import { HashingService } from './service/password-hash/password-hash.service';
import { TokenService } from './service/token/token.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    // jwt service
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService): JwtModuleOptions => {
        const secret = cs.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');

        return {
          secret,
          signOptions: {
            expiresIn: cs.getOrThrow<number>('JWT_ACCESS_TOKEN_EXPIRATION'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: AUTH_REPO,
      useClass: AuthRepo,
    },
    TokenService,
    HashingService,
  ],
  controllers: [AuthController],
  exports: [AUTH_SERVICE, TokenService],
})
export class AuthModule {}
