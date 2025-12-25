import { CreateAuthDTO } from "../dto/create-auth.dto";
import { LoginDTO } from "../dto/login.dto";
import { Auth } from "../entity/auth.entity";

export interface AuthContract {
  create(data:CreateAuthDTO): Promise<Auth>;
  login(data: LoginDTO): Promise<{ accessToken: string, refreshToken: string }>;
}