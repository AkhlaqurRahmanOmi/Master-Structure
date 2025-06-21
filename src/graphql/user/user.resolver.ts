import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubsubService } from '../../shared/pubsub/pubsub.service';
import { CreateUserInput } from './dto/user.create.dto';
import { UserDTO } from './dto/user.dto';
import { UserService } from '../../modules/user/user.service';
import { plainToInstance } from 'class-transformer';

@Resolver(() => UserDTO)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    @Inject('PUB_SUB') private readonly pubSub: PubsubService,
  ) {}

  @Query(() => [UserDTO])
  async users() {
    const result = await this.userService.getAllUsers();
    if (!result.success) {
      throw new Error('Failed to fetch users');
    }
    return result.data?.map(user => plainToInstance(UserDTO, user)) || [];
  }

  @Query(() => UserDTO, { nullable: true })
  async user(@Args('id') id: number) {
    const result = await this.userService.getUserById(id);
    if (!result.success || !result.data) {
      return null;
    }
    return plainToInstance(UserDTO, result.data);
  }

  @Mutation(() => UserDTO)
  async createUser(@Args('input') input: CreateUserInput) {
    const result = await this.userService.createUser(input);
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to create user');
    }
    return plainToInstance(UserDTO, result.data);
  }

  @Mutation(() => UserDTO)
  async updateUser(
    @Args('id') id: number,
    @Args('input') input: CreateUserInput,
  ) {
    const result = await this.userService.updateUser(id, input);
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || `Failed to update user with id ${id}`);
    }
    return plainToInstance(UserDTO, result.data);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: number) {
    const result = await this.userService.deleteUser(id);
    if (!result.success) {
      throw new Error(result.error?.message || `Failed to delete user with id ${id}`);
    }
    return true;
  }

  @Subscription(() => UserDTO, {
    name: 'userCreated',
    filter: (payload, variables) => true,
  })
  userCreated() {
    return this.userService.subscribeToUserCreated();
  }

  @Subscription(() => UserDTO, { name: 'userUpdated' })
  userUpdated() {
    return this.userService.subscribeToUserUpdated();
  }

  @Subscription(() => UserDTO, { name: 'userDeleted' })
  userDeleted() {
    return this.userService.subscribeToUserDeleted();
  }
}
