import { IsNotBlank } from "@/src/common/decorator/validator/is-not-blank.decorator";

export class LoginDTO {

  @IsNotBlank()
  username: string;
  
  @IsNotBlank()
  password: string;
}
