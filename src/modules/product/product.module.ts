import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { PrismaModule } from '../../core/config/prisma/prisma.module';
import { PubsubService } from '../../shared/pubsub/pubsub.service';
import { ResponseBuilderService } from '../../shared/services/response-builder.service';
import { TraceIdService } from '../../shared/services/trace-id.service';
import { CacheService } from '../../shared/services/cache.service';
import { PerformanceMonitorService } from '../../shared/services/performance-monitor.service';
import { QueryOptimizerService } from '../../shared/services/query-optimizer.service';
import { LoggingConfigService } from '../../shared/services/logging-config.service';
import { ProductResolver } from '../../graphql/product/product.resolver';
import { ProductController } from '../../api/rest/product/product.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ProductResolver,
    ResponseBuilderService,
    TraceIdService,
    CacheService,
    PerformanceMonitorService,
    QueryOptimizerService,
    LoggingConfigService,
    {
      provide: 'PUB_SUB',
      useClass: PubsubService,
    },
  ],
  exports: [
    ProductRepository,
    ProductService,
    ProductResolver,
  ],
})
export class ProductModule {}