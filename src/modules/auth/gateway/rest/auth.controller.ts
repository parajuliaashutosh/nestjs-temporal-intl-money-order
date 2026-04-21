import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { AppException } from '@/src/common/exception/app.exception';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { UTIL_FUNCTIONS } from '@/src/common/util/common-functions';
import { UserDeviceDataDTO } from '@/src/modules/login-log/dto/user-device-data.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AUTH_SERVICE } from '../../auth.constant';
import type { AuthContract } from '../../contract/auth.contract';
import { LoginReqDTO } from './dto/login-req.dto';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthContract,
    private readonly configService: ConfigService,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns access and refresh tokens as HTTP-only cookies.',
    apiResponses: [
      {
        status: 400,
        description: 'Bad request - Invalid credentials',
      },
      {
        status: 401,
        description: 'Unauthorized - Invalid email or password',
      },
    ],
  })
  async login(
    @Body() data: LoginReqDTO,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const xForwardedFor =
      req.headers['x-real-ip'] || req.headers['x-forwarded-for'];

    let clientIp: string;

    if (typeof xForwardedFor === 'string')
      clientIp = xForwardedFor.split(',')[0]; // Get the first IP address
    else clientIp = req.connection.remoteAddress ?? 'unknown'; // Fallback to remoteAddress

    // clientIp = '103.163.182.223';
    const deviceId =
      (req.cookies.deviceId as string) || UTIL_FUNCTIONS.createV7UUID();

    const userAgent = req.headers['user-agent'];

    const deviceData: UserDeviceDataDTO = {
      clientIp,
      deviceId,
      userAgent,
    };
    const { accessToken, refreshToken } = await this.authService.login(
      data,
      deviceData,
    );

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'LOCAL_DEVELOPMENT', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'LOCAL_DEVELOPMENT', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    res.cookie('deviceId', deviceId, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'LOCAL_DEVELOPMENT', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 100 * 365 * 24 * 60 * 60 * 1000, // 100 year in milliseconds
    });

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Login successful')
      .build();
  }

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'Refresh access token',
    description:
      'Refresh the access token using the refresh token stored in HTTP-only cookies. Returns new access and refresh tokens as HTTP-only cookies.',
    apiResponses: [
      {
        status: 400,
        description: 'Bad request - Refresh token not found in cookies',
      },
      {
        status: 401,
        description: 'Unauthorized - Invalid or expired refresh token',
      },
    ],
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
    const refreshToken = cookies.refreshToken;

    if (!refreshToken)
      throw AppException.badRequest('Refresh token not found in cookies');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'PRODUCTION', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'PRODUCTION', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
  }
}
