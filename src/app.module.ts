import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitOfWork } from './shared/services/unit-of-work/unit-of-work.service';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './core/config/prisma/prisma.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      playground: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    UnitOfWork,
  ],
  exports: [
    UnitOfWork,
  ],
})
export class AppModule {}
