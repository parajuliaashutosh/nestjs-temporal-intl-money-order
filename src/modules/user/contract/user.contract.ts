import { DataAndCount } from "@/src/common/response-type/pagination/data-and-count";
import { Auth } from "../../auth/entity/auth.entity";
import { CreateUserDTO } from "../dto/create-user.dto";
import { FilterUsersDTO } from "../dto/filter-users.dto";
import { User } from "../entity/user.entity";

export interface UserContract {
    create(data: CreateUserDTO, auth: Auth): Promise<User>;
    verifyUserKYC(id: string): Promise<void>;
    rejectUserKYC(id: string): Promise<void>;
    getUserById(id: string): Promise<User | null>;
    filterUsers(filter: FilterUsersDTO): Promise<DataAndCount<User[]>>;
}