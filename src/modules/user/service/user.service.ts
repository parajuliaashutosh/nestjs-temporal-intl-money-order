import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { UserContract } from '../contract/user.contract';
import { CreateUserDTO } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';

@Injectable()
export class UserService implements UserContract {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
    ) {}

    public async create(data: CreateUserDTO, auth: Auth): Promise<User> {
        throw new Error('Method not implemented.');
        const user = new User();
        user.firstName = data.firstName;
        user.middleName = data.middleName;
        user.lastName = data.lastName;
        user.auth = auth;
        return await this.userRepo.save(user);
    }
}
