import { Injectable, HttpStatus } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Result } from '../../shared/types/result.type';
import { User } from '@prisma/client';
import { createBaseUserDTO} from './dto/create.base-user.dto';
import { updateBaseUserDTO} from './dto/update.base-user.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: number): Promise<Result<User>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          success: false,
          error: {
            message: `User with id ${id} not found`,
            code: 'NOT_FOUND',
          },
        };
      }

      return {
        statusCode: HttpStatus.OK,
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: 'An unexpected error occurred',
        },
      };
    }
  }

  async getAllUsers(): Promise<Result<User[]>> {
    try {
      const users = await this.userRepository.findAll();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: 'An unexpected error occurred',
        },
      };
    }
  }

  async createUser(data: createBaseUserDTO): Promise<Result<User>> {
    try {
      const newUser = await this.userRepository.create(data);
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        data: newUser,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        error: {
          message: 'Error creating user',
        },
      };
    }
  }

  async updateUser(id: number, data: updateBaseUserDTO): Promise<Result<User>> {
    try {
      const user = await this.userRepository.update(id, data);
      return {
        statusCode: HttpStatus.OK,
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        error: {
          message: `Error updating user with id ${id}`,
        },
      };
    }
  }

  async deleteUser(id: number): Promise<Result<null>> {
    try {
      await this.userRepository.delete(id);
      return {
        statusCode: HttpStatus.OK,
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        error: {
          message: `Error deleting user with id ${id}`,
        },
      };
    }
  }
}
