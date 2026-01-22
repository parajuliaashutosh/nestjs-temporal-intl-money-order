import { AppException } from '@/src/common/exception/app.exception';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
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
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns access and refresh tokens as HTTP-only cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Tokens set in cookies.',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid credentials',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
  })
  async login(
    @Body() data: LoginReqDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(data);

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'PRODUCTION', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'PRODUCTION', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Login successful')
      .build();
  }

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access and refresh tokens using the refresh token from cookies.',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully. New tokens set in cookies.',
    schema: {
      example: {
        success: true,
        message: 'Token refreshed successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Refresh token not found in cookies',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
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
