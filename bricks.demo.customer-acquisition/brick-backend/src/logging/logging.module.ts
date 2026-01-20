import { Module } from '@nestjs/common';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { MetricsModule } from '../metrics/metrics.module';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    MetricsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.id || randomUUID(),
        transport: process.env.NODE_ENV === 'development' ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        } : undefined,
        customProps: (req) => ({
          context: 'http',
          userAgent: req.headers['user-agent'],
        }),
        // Reduce noise: ignore GraphQL introspection & Apollo tracing helper requests
        autoLogging: {
          ignore: (req: any) => {
            if (req.url !== '/graphql') return false;
            const isTracing = 'x-apollo-tracing' in req.headers || 'apollo-query-plan-experimental' in req.headers;
            const raw = typeof req.body === 'string' ? req.body : '';
            const isIntrospection = /__schema|__type/.test(raw);
            return isTracing || isIntrospection;
          }
        }
      }
    })
  ],
  providers: [LoggingInterceptor],
  exports: [LoggingInterceptor],
})
export class LoggingModule {}
