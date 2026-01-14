import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: 'sub' | undefined, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const req = gqlCtx.getContext<{ req: Request }>().req;
    const user = req.user as Record<string, unknown> | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
