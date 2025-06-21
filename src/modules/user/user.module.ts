import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from '../../api/rest/user/user.controller';
import { UserRepository } from './user.repository';
import { UserResolver } from '../../graphql/user/user.resolver';
import { PrismaModule } from '../../core/config/prisma/prisma.module';
import { PubsubService } from '../../shared/pubsub/pubsub.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserResolver,
    {
      provide: 'PUB_SUB',
      useClass: PubsubService,
    },
  ],
  exports: [
    UserRepository,
    UserService, 
  ],
})
export class UserModule {}
