// token.service.ts
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

export interface TokenPayload {
  key: string;
  id: string;
  user: {
    userId: string;
    country: SupportedCountry;
  }[];
  adminId: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private sign(payload: TokenPayload, options: JwtSignOptions): string {
    return this.jwtService.sign({ ...payload }, options);
  }

  private verify(token: string, secret: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token, { secret });
  }

  private generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign({ ...payload });
  }

  private generateRefreshToken(payload: TokenPayload): string {
    const expiresIn = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TOKEN_EXPIRATION',
    );
    const secret = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );

    return this.sign(payload, {
      expiresIn,
      secret,
    });
  }

  public generateAccessAndRefreshTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): TokenPayload {
    return this.jwtService.verify(token);
  }

  public verifyRefreshToken(token: string): TokenPayload {
    const secret = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    return this.verify(token, secret);
  }
}
