import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitOfWork } from './shared/services/unit-of-work/unit-of-work.service';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './core/config/prisma/prisma.module';
import { winstonConfig } from './logger/winston.config';
import { WinstonModule } from 'nest-winston';
import { HttpLoggerMiddleware } from './logger/http-logger.middleware';

@Module({
  imports: [
    UserModule,
    WinstonModule.forRoot(winstonConfig),
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
