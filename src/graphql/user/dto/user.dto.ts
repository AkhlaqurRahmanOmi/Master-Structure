import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserBaseDTO } from '../../../modules/user/dto/user-base.dto';

// this one is example to make the dto make with graphql compatible with the UserBaseDTO
@ObjectType()
export class UserDTO extends UserBaseDTO {
}


// //this one is another approach
// @ObjectType()
// export class UserDTO extends UserBaseDTO{}