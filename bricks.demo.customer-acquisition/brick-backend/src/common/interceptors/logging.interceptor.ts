import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger, private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const started = Date.now();
    // Detect if GraphQL or HTTP
    const isGraphQL = context.getType<'graphql'>() === 'graphql';
    let operationName = 'unknown';
    let fieldName: string | undefined;
    if (isGraphQL) {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      operationName = info?.operation?.operation || 'graphql';
      fieldName = info?.fieldName;
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          if (fieldName) this.metrics.recordResolver(fieldName, ms);
          this.logger.info({ msg: 'Resolver completed', kind: operationName, field: fieldName, durationMs: ms });
        },
        error: (err) => {
          const ms = Date.now() - started;
            this.logger.error({ msg: 'Resolver error', kind: operationName, field: fieldName, durationMs: ms, error: err?.message });
        }
      })
    );
  }
}
