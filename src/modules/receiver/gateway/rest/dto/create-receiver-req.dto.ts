import { IsNotBlank } from "@/src/common/decorator/validator/is-not-blank.decorator";
import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class CreateReceiverReqDTO {
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
        @IsNumber()
        @IsPositive()
        bankAccountNumber: string;
    
}