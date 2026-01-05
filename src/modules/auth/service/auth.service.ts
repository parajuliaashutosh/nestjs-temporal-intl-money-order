import { AppException } from '@/src/common/exception/app.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthContract } from '../contract/auth.contract';
import { CreateAuthDTO } from '../dto/create-auth.dto';
import { LoginDTO } from '../dto/login.dto';
import { Auth } from '../entity/auth.entity';
import { HashingService } from './password-hash/password-hash.service';
import { TokenPayload, TokenService } from './token/token.service';

@Injectable()
export class AuthService implements AuthContract {
  constructor(
    @InjectRepository(Auth) private authRepo: Repository<Auth>,
    private readonly tokenService: TokenService,
    private readonly hashService: HashingService,
  ) {}

  public async create(data: CreateAuthDTO): Promise<Auth> {
    const auth = new Auth();
    auth.email = data.email;
    auth.password = await this.hashService.hash(data.password);
    auth.phone = data.phone;
    auth.role = data.role;

    const resp = await this.authRepo.save(auth);
    const { password, ...result } = resp;
    void password;
    return result as Auth;
  }

  public async login(
    data: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const auth = await this.authRepo
      .createQueryBuilder('auth')
      .where('auth.email = :username OR auth.phone = :username', {
        username: data.username,
      })
      .addSelect('auth.password')
      .getOne();
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
      userId: auth.users?.[0]?.id,
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
      userId: auth.users?.[0]?.id,
      adminId: auth.admin?.id,
      role: auth.role,
    };
    return this.tokenService.generateAccessAndRefreshTokens(tokenPayload);
  }

  public async getAuthById(id: string): Promise<Auth | null> {
    return this.authRepo
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.users', 'users')
      .leftJoinAndSelect('auth.admin', 'admin')
      .where('auth.id = :id', { id })
      .getOne();
  }
}
