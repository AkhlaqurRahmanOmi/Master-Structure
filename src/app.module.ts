import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitOfWork } from './shared/services/unit-of-work/unit-of-work.service';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { PrismaModule } from './core/config/prisma/prisma.module';
import { winstonConfig } from './logger/winston.config';
import { WinstonModule } from 'nest-winston';
import { EnhancedHttpLoggerMiddleware, TraceIdService } from './shared';
import { GlobalResponseInterceptor } from './shared/interceptors/global-response.interceptor';
import { CacheInterceptor } from './shared/interceptors/cache.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { EnhancedValidationPipe } from './shared/pipes/enhanced-validation.pipe';
import { ResponseBuilderService } from './shared/services/response-builder.service';
import { CacheService } from './shared/services/cache.service';

@Module({
  imports: [
    UserModule,
    ProductModule,
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
    TraceIdService,
    ResponseBuilderService,
    CacheService,
    Reflector,
    EnhancedHttpLoggerMiddleware,
    // Global interceptors (order matters - cache first, then response transformation)
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
    // Global filters
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global validation pipe with custom error handling
    {
      provide: APP_PIPE,
      useClass: EnhancedValidationPipe,
    },
  ],
  exports: [
    UnitOfWork,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EnhancedHttpLoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
