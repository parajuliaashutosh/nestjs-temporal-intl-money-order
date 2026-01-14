import { Auth } from "../../auth/entity/auth.entity";
import { CreateAdminDTO } from "../dto/create-admin.dto";
import { Admin } from "../entity/admin.entity";

export interface AdminContract {
    create(data: CreateAdminDTO, auth: Auth): Promise<Admin>;
}