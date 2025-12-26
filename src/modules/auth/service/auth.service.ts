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
    
    return await this.authRepo.save(auth);
  }

  public async login(data: LoginDTO): Promise<{ accessToken: string, refreshToken: string }> {
    
    const auth = await this.authRepo.createQueryBuilder('auth')
      .where('auth.email = :username OR auth.phone = :username', { username: data.username })
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
      key: "11132", // Replace with actual key
      id: auth.id,
      userId: auth.user?.id,
      adminId: auth.admin?.id,
      role: auth.role,
    }

    return this.tokenService.generateAccessAndRefreshTokens(tokenPayload)
  }
}
