import { CreateUserInput } from './user.create.dto';
import { InputType } from '@nestjs/graphql';

@InputType()
export class updateUserInput extends CreateUserInput{}