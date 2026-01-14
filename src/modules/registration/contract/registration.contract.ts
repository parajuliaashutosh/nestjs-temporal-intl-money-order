import { Admin } from "../../admin/entity/admin.entity";
import { User } from "../../user/entity/user.entity";
import { RegisterAdminDTO } from "../dto/register-admin.dto";
import { RegisterUserDTO } from "../dto/register-user.dto";

export interface RegistrationContract {
    registerUser(data: RegisterUserDTO): Promise<User>;
    registerAdmin(data: RegisterAdminDTO): Promise<Admin>;

    verifyUserKYC(id: string): Promise<void>;
    rejectUserKYC(id: string): Promise<void>;
}