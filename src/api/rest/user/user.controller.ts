import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Result } from '../../../shared/types/result.type';
import { UserService } from '../../../modules/user/user.service';
import { User } from '@prisma/client';
import {CreateUserDto} from './dto/create.user.dto';
import {UpdateUserDto} from './dto/update.user.dto';


@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}
  
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<Result<User>> {
    return this.userService.getUserById(id);
  }

  @Get('all-users')
  async getAllUsers(): Promise<Result<User[]>> {
    return this.userService.getAllUsers();
  }

  @Post('add')
  async createUser(@Body() userData: CreateUserDto): Promise<Result<User>> {
    return this.userService.createUser(userData);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: UpdateUserDto
  ): Promise<Result<User>> {
    return this.userService.updateUser(id, userData);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<Result<null>> {
    return this.userService.deleteUser(id);
  }

}
