import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable } from '@nestjs/common';
import type { LoginLogContract } from '../../login-log/contract/login-log.contract';
import { UserDeviceDataDTO } from '../../login-log/dto/user-device-data.dto';
import { LOGIN_LOG_SERVICE } from '../../login-log/login-log.constant';
import { AUTH_REPO, PASSWORD_HISTORY_LIMIT } from '../auth.constant';
import { AuthContract } from '../contract/auth.contract';
import type { AuthRepoContract } from '../contract/auth.repo.contract';
import { CreateAuthDTO } from '../dto/create-auth.dto';
import { LoginDTO } from '../dto/login.dto';
import { UpdatePasswordDTO } from '../dto/update-password.dto';
import { Auth } from '../entity/auth.entity';
import { PasswordHistory } from '../entity/password-history.entity';
import { HashingService } from './password-hash/password-hash.service';
import { TokenPayload, TokenService } from './token/token.service';

@Injectable()
export class AuthService implements AuthContract {
  constructor(
    @Inject(AUTH_REPO)
    private readonly authRepo: AuthRepoContract,
    private readonly tokenService: TokenService,
    private readonly hashService: HashingService,

    @Inject(LOGIN_LOG_SERVICE)
    private readonly loginLogService: LoginLogContract,
  ) {}

  public async create(data: CreateAuthDTO): Promise<Auth> {
    const auth: Partial<Auth> = {};
    auth.email = data.email;
    auth.password = await this.hashService.hash(data.password);
    auth.phone = data.phone;
    auth.role = data.role;

    const created = await this.authRepo.create(auth);

    await this.authRepo.createPasswordHistory(created.id, auth.password);

    return created;
  }

  public async login(
    data: LoginDTO,
    userDeviceData: UserDeviceDataDTO,
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

    const loginLog = await this.loginLogService.createLoginLog(
      userDeviceData,
      auth,
    );

    const tokenPayload: TokenPayload = {
      key: loginLog.id,
      id: auth.id,
      users:
        auth.users?.map((user) => ({
          userId: user.id,
          country: user.country,
          kycStatus: user.kycStatus,
          version: user.version,
        })) || [],
      adminId: auth.admin?.id,
      role: auth.role,
    };

    return this.tokenService.generateAccessAndRefreshTokens(tokenPayload);
  }

  public async refreshToken(
    refreshToken: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const check = this.tokenService.verifyRefreshToken(refreshToken);

    const loginLog = await this.loginLogService.getLoginLogBySessionKey(
      check.key,
    );

    if (!loginLog) {
      throw AppException.badRequest('SESSION_NOT_FOUND');
    }

    if (loginLog.rawUserAgent !== userAgent) {
      await this.loginLogService.markLogout(
        check.key,
        check.id,
        'SYSTEM_DENIED_REFRESH:USER_AGENT_MISMATCH',
      );
      throw AppException.unauthorized('REFRESH_DENIED_USER_AGENT_MISMATCH');
    }

    const auth = await this.getAuthById(check.id);
    if (!auth) {
      throw AppException.badRequest('AUTH_NOT_FOUND');
    }

    const tokenPayload: TokenPayload = {
      key: check.key,
      id: auth.id,
      users:
        auth.users?.map((user) => ({
          userId: user.id,
          country: user.country,
          version: user.version,
        })) || [],
      adminId: auth.admin?.id,
      role: auth.role,
    };
    return this.tokenService.generateAccessAndRefreshTokens(tokenPayload);
  }

  public async getAuthById(id: string): Promise<Auth | null> {
    return this.authRepo.findById(id);
  }

  public async getProfile(id: string): Promise<Auth> {
    const auth = await this.authRepo.findById(id);
    if (!auth) {
      throw AppException.badRequest('AUTH_NOT_FOUND');
    }
    return auth;
  }

  @Transactional()
  public async updatePassword(
    id: string,
    data: UpdatePasswordDTO,
  ): Promise<void> {
    const auth = await this.authRepo.findByIdForAuthentication(id);

    if (!auth) {
      throw AppException.badRequest('AUTH_NOT_FOUND');
    }

    const isCurrentPasswordValid = await this.hashService.compare(
      data.currentPassword,
      auth.password,
    );

    if (!isCurrentPasswordValid) {
      throw AppException.badRequest('INVALID_CURRENT_PASSWORD');
    }

    const recentPasswords = await this.authRepo.getRecentPasswordHistories(
      id,
      PASSWORD_HISTORY_LIMIT,
    );

    // The current password is always part of the check, even if the account
    // predates password history.
    const usedHashes = new Set([
      auth.password,
      ...recentPasswords.map((history) => history.password),
    ]);

    for (const hash of usedHashes) {
      const isReused = await this.hashService.compare(data.newPassword, hash);
      if (isReused) {
        throw AppException.badRequest('PASSWORD_RECENTLY_USED');
      }
    }

    const hashedPassword = await this.hashService.hash(data.newPassword);

    await this.authRepo.updatePassword(id, hashedPassword);
    await this.authRepo.createPasswordHistory(id, hashedPassword);
  }

  public async getPasswordHistory(id: string): Promise<PasswordHistory[]> {
    return await this.authRepo.getPasswordHistories(id);
  }

  public async getAuthByEmail(email: string): Promise<Auth | null> {
    return await this.authRepo.getAuthByEmail(email);
  }

  public async getAuthByPhone(phone: string): Promise<Auth | null> {
    return await this.authRepo.getAuthByPhone(phone);
  }

  public async getAuthByUserIdAndCountry(
    userId: string,
    country: SupportedCountry,
  ): Promise<Auth | null> {
    return await this.authRepo.getAuthByUserIdAndCountry(userId, country);
  }
}
