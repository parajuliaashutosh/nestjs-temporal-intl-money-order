import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthContract } from '../contract/auth.contract';
import { CreateAuthDTO } from '../dto/create-auth.dto';
import { Auth } from '../entity/auth.entity';
import { HashingService } from './password-hash/password-hash.service';
import { TokenService } from './token/token.service';

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
}
