import { Field, InputType } from '@nestjs/graphql';
import { UserBaseDTO } from '../../../modules/user/dto/user-base.dto';

@InputType()
export class CreateUserInput extends UserBaseDTO {
}