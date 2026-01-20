import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Login simple
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  login(user: any) {
    // El role está en user.employee.role (relación eager). Propagamos como employeeRole y roles array.
    const employeeRole = user?.employee?.role;
    const payload = {
      sub: user.id,
      email: user.email,
      employeeId: user.employeeId,
      employeeRole,
      roles: employeeRole ? [employeeRole] : [],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
