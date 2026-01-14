// auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_SERVICE } from './auth.constant';
import { Auth } from './entity/auth.entity';
import { AuthController } from './gateway/rest/auth.controller';
import { AuthService } from './service/auth.service';
import { HashingService } from './service/password-hash/password-hash.service';
import { TokenService } from './service/token/token.service';

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
    TokenService,
    HashingService
  ],
  controllers: [AuthController],
  exports: [AUTH_SERVICE, TokenService],
})
export class AuthModule {}
