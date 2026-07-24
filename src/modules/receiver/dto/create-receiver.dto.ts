import { IsNotBlank } from "@/src/common/decorator/validator/is-not-blank.decorator";
import { IsOptional } from "class-validator";

export class CreateReceiverDTO {

    @IsNotBlank()
    firstName: string;

    @IsOptional()
    middleName?: string;

    @IsNotBlank()
    lastName: string;

    @IsOptional()
    email?: string;

    @IsNotBlank()
    phoneNumber: string;

    @IsOptional()
    address?: string;

    @IsNotBlank()
    bankName: string;

    @IsNotBlank()
    bankAccountNumber: string;

    @IsNotBlank()
    userId: string;
}