import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from '../../api/rest/user/user.controller';
import { UserRepository } from './user.repository';
import { PrismaModule } from '../../core/config/prisma/prisma.module';

@Module({
  // imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService,UserRepository]

})
export class UserModule {}
