import { CreateUserInput } from './user.create.dto';
import {InputType, ObjectType, PartialType} from '@nestjs/graphql';

@InputType()
// @ObjectType()
export class updateUserInput extends PartialType(CreateUserInput){}