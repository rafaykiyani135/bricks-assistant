import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      // no roles required -> allow
      return true;
    }

    // Get request (works both for REST and GQL)
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req.user;

    console.log('RolesGuard: user=', user, ' requiredRoles=', requiredRoles);

    if (!user) {
      // not authenticated (GqlAuthGuard should have run before this)
      throw new ForbiddenException('User not authenticated');
    }

    // Extraemos roles desde distintos posibles lugares del user (payload JWT enriquecido)
    const userRoles: string[] = Array.isArray(user?.roles)
      ? user.roles
      : user?.employeeRole
      ? [user.employeeRole]
      : user?.employee?.role
      ? [user.employee.role]
      : [];

    const hasRole = requiredRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
