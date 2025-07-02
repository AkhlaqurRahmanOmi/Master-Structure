import { IsString, IsEmail, IsOptional, IsInt } from 'class-validator';

export class UserBaseDTO {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}