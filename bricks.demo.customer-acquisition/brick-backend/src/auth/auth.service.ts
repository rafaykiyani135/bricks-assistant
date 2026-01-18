import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { EmployeesService } from 'src/employees/employees.service';

const ACCESS_TOKEN_SECRET = 'JWT_ACCESS_SECRET';
const REFRESH_TOKEN_SECRET = 'JWT_REFRESH_SECRET';

export type GoogleUser = {
  email: string;
  name: string;
  googleId: string;
  avatar: string;
};

@Injectable()
export class AuthService {
  constructor(private employees: EmployeesService) {}

  async handleGoogleLogin(googleUser: GoogleUser) {
    let user = await this.employees.findByEmail(googleUser.email);

    if (!user) {
      user = await this.employees.create({
        email: googleUser.email,
        name: googleUser.name,
      });
    }

    const accessToken = jwt.sign({ sub: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: '7d',
    });
    const refreshToken = jwt.sign({ sub: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    return { user, accessToken, refreshToken };
  }

  refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({ sub: payload.sub }, ACCESS_TOKEN_SECRET, {
        expiresIn: '7d',
      });
      return accessToken;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getAuthState(accessToken: string) {
    try {
      const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
      const userId = typeof payload?.sub === 'string' ? payload.sub : undefined;

      if (!userId) {
        throw new UnauthorizedException('Invalid access token');
      }

      const user = await this.employees.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
