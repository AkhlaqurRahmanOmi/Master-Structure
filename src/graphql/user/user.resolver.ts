import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubsubService } from '../../shared/pubsub/pubsub.service';
import { UserRepository } from '../../modules/user/user.repository';
import { User } from '@prisma/client';
import { CreateUserInput } from './dto/user.create.dto';
import { UserDTO } from './dto/user.dto';

@Resolver(() => UserDTO)
export class UserResolver {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('PUB_SUB') private readonly pubSub: PubsubService,
  ) {}

  @Query(() => [UserDTO])
  async users(): Promise<User[]> {
    return this.userRepository.findAll();
  }
  //
  @Query(() => UserDTO, { nullable: true })
  async user(@Args('id') id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }
  //
  @Mutation(() => UserDTO)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    const newUser = await this.userRepository.create(input);
    await this.pubSub.publish('userCreated', newUser);
    return newUser;
  }
  //
  @Mutation(() => UserDTO)
  async updateUser(
    @Args('id') id: number,
    @Args('input', { type: () => CreateUserInput }) input: Partial<CreateUserInput>,
  ): Promise<User> {
    const updatedUser = await this.userRepository.update(id, input);
    await this.pubSub.publish('userUpdated', updatedUser);
    return updatedUser;
  }
  //
  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: number): Promise<boolean> {
    await this.userRepository.delete(id);
    await this.pubSub.publish('userDeleted', { id });
    return true;
  }
  //
  @Subscription(() => UserDTO, {
    name: 'userCreated',
    filter: (payload, variables) => true,
  })
  userCreated() {
    return this.pubSub.asyncIterator('userCreated');
  }
  //
  @Subscription(() => UserDTO, { name: 'userUpdated' })
  userUpdated() {
    return this.pubSub.asyncIterator('userUpdated');
  }
  //
  @Subscription(() => UserDTO, { name: 'userDeleted' })
  userDeleted() {
    return this.pubSub.asyncIterator('userDeleted');
  }
}
