import { UserBaseDTO } from './user-base.dto';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from '../../../graphql/user/dto/user.create.dto';

@InputType()
export class updateBaseUserDTO extends PartialType(CreateUserInput) {

}