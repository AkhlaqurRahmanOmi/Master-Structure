import { UserBaseDTO } from './user-base.dto';
import {InputType, ObjectType} from "@nestjs/graphql";


@InputType()
// @ObjectType()
export class createBaseUserDTO extends UserBaseDTO{
}