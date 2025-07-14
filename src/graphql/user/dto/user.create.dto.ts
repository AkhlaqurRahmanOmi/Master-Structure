import {InputType, Field, ObjectType} from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';
import {createBaseUserDTO} from "../../../modules/user/dto/create.base-user.dto";


@InputType()
// @ObjectType()
export class CreateUserInput extends createBaseUserDTO{

}