import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

interface StandardGraphQLErrorShape {
  success: false;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string[] | string;
}

@Catch()
export class GqlExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const info = gqlHost.getInfo();

    const path = info?.path?.key || info?.fieldName || 'unknown';

    let status: number;
    let message: string;
    let code: string;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: any = exception.getResponse();
      message = (response?.message || exception.message) as string;
      code = HttpStatus[status] || 'HTTP_ERROR';
      details = response?.errors || response;
    } else if (exception?.message) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      code = 'INTERNAL_ERROR';
      if (exception?.extensions) {
        details = exception.extensions;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unexpected error';
      code = 'INTERNAL_ERROR';
    }

    const formatted: StandardGraphQLErrorShape = {
      success: false,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path,
    };

    // Lanzamos GraphQLError con extensions para que formatError lo consuma sin "Unexpected error value".
    // GraphQLErrorOptions typing puede exigir index signature; convertimos a simple record.
    throw new GraphQLError(message, undefined, undefined, undefined, undefined, undefined, formatted as Record<string, any>);
  }
}
