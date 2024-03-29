import {IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class LoginByEmail {
  @IsNotEmpty({
    message: 'Необходимо указать email',
  })
  @IsString()
  email: string;

  @IsNotEmpty({
    message: 'Необходимо указать пароль',
  })
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean
}
