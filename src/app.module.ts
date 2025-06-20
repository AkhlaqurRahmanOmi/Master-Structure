import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitOfWork } from './shared/services/unit-of-work/unit-of-work.service';
import { UserModule } from './modules/user/user.module';
import { UserResolver } from './graphql/user/user.resolver';
import { PrismaModule } from './core/config/prisma/prisma.module';
import { PubsubService } from './shared/pubsub/pubsub.service';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      playground: true,
      // context: ({ req, res }) => ({ req, res }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    UnitOfWork,
    UserResolver,
    PubsubService,
    {
      provide: 'PUB_SUB',
      useExisting: PubsubService,
    },

  ],
  exports: [
    UnitOfWork,
    PubsubService,
    'PUB_SUB',
  ],
})
export class AppModule {}
