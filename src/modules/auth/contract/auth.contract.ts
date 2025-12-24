import { CreateAuthDTO } from "../dto/create-auth.dto";
import { Auth } from "../entity/auth.entity";

export interface AuthContract {
  create(data:CreateAuthDTO): Promise<Auth>;
}