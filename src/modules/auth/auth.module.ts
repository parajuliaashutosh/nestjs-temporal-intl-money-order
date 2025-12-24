// auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AUTH_SERVICE } from './auth.constant';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService): JwtModuleOptions => {
        const secret = cs.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');
        
        return {
          secret,
          signOptions: {
            expiresIn: cs.getOrThrow<number>('JWT_ACCESS_TOKEN_EXPIRATION'),
          }
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
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}