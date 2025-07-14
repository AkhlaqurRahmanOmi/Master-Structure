import { IsString, IsEmail, IsOptional, IsInt } from 'class-validator';
import {Field,InputType, Int, ObjectType} from "@nestjs/graphql";

@InputType('UserBaseInput')
@ObjectType()
export class UserBaseDTO {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  id?: number;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}