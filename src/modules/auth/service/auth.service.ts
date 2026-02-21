import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPO } from '../auth.constant';
import { AuthContract } from '../contract/auth.contract';
import type { AuthRepoContract } from '../contract/auth.repo.contract';
import { CreateAuthDTO } from '../dto/create-auth.dto';
import { LoginDTO } from '../dto/login.dto';
import { Auth } from '../entity/auth.entity';
import { HashingService } from './password-hash/password-hash.service';
import { TokenPayload, TokenService } from './token/token.service';

@Injectable()
export class AuthService implements AuthContract {
  constructor(
    @Inject(AUTH_REPO)
    private readonly authRepo: AuthRepoContract,
    private readonly tokenService: TokenService,
    private readonly hashService: HashingService,
  ) {}

  public async create(data: CreateAuthDTO): Promise<Auth> {
    const auth: Partial<Auth> = {};
    auth.email = data.email;
    auth.password = await this.hashService.hash(data.password);
    auth.phone = data.phone;
    auth.role = data.role;

    return await this.authRepo.create(auth);
  }

  public async login(
    data: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const auth = await this.authRepo.findByEmailOrPhoneForAuthentication(
      data.username,
    );

    if (!auth) {
      throw AppException.badRequest('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await this.hashService.compare(
      data.password,
      auth.password,
    );

    if (!isPasswordValid) {
      throw AppException.badRequest('INVALID_CREDENTIALS');
    }

    const tokenPayload: TokenPayload = {
      key: crypto.randomUUID(),
      id: auth.id,
      user:
        auth.users?.map((user) => ({
          userId: user.id,
          country: user.country,
        })) || [],
      adminId: auth.admin?.id,
      role: auth.role,
    };

    return this.tokenService.generateAccessAndRefreshTokens(tokenPayload);
  }

  public async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const check = this.tokenService.verifyRefreshToken(refreshToken);

    const auth = await this.getAuthById(check.id);
    if (!auth) {
      throw AppException.badRequest('AUTH_NOT_FOUND');
    }

    const tokenPayload: TokenPayload = {
      key: crypto.randomUUID(),
      id: auth.id,
      user:
        auth.users?.map((user) => ({
          userId: user.id,
          country: user.country,
        })) || [],
      adminId: auth.admin?.id,
      role: auth.role,
    };
    return this.tokenService.generateAccessAndRefreshTokens(tokenPayload);
  }

  public async getAuthById(id: string): Promise<Auth | null> {
    return this.authRepo.findById(id);
  }

  public async getAuthByEmail(email: string): Promise<Auth | null> {
    return await this.authRepo.getAuthByEmail(email);
  }

  public async getAuthByPhone(phone: string): Promise<Auth | null> {
    return await this.authRepo.getAuthByPhone(phone);
  }
}
