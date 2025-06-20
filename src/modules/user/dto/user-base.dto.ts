import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UserBaseDTO {

  email: string;


  password: string;
}