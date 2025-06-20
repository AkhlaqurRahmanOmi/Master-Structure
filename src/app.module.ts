import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './core/config/prisma/prisma.service';
import { UnitOfWorkService } from './shared/services/unit-of-work/unit-of-work.service';
import { UserModule } from './modules/user/user.module';
import { UserController } from './api/rest/user/user.controller';
import { UserResolver } from './graphql/user/user.resolver';
import { PrismaModule } from './core/config/prisma/prisma.module';

@Module({
  imports: [UserModule,PrismaModule],
  controllers: [AppController],
  providers: [AppService, UnitOfWorkService, UserResolver],
})
export class AppModule {}
