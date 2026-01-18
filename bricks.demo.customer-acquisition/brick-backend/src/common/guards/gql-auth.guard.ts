import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: Request }>().req;

    // temporary fix for e2e tests due overrideProvider(APP_GUARD) not working
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    if (req.baseUrl !== '/graphql') {
      return true;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing token');

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, 'JWT_ACCESS_SECRET');
      req.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
