import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService, GoogleUser } from './auth.service';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FRONTEND_URL = 'http://localhost:3000';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as GoogleUser;

    try {
      const { accessToken, refreshToken } =
        await this.auth.handleGoogleLogin(user);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SEVEN_DAYS_MS,
      });

      return res.redirect(
        `${FRONTEND_URL}/auth/success?accessToken=${accessToken}`,
      );
    } catch {
      return res.redirect(`${FRONTEND_URL}/auth/error`);
    }
  }

  @Get('me')
  async getProfile(@Req() req: Request) {
    const accessToken = this.extractAccessToken(req);
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    const user = await this.auth.getAuthState(accessToken);
    return { user };
  }

  @Get('refresh')
  async refresh(@Req() req: Request) {
    const token = this.extractRefreshToken(req);
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const accessToken = this.auth.refreshAccessToken(token);
    const user = await this.auth.getAuthState(accessToken);
    return { accessToken, user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { success: true };
  }

  private extractAccessToken(req: Request) {
    const headerAuth = req.headers?.authorization;
    if (headerAuth?.startsWith('Bearer ')) {
      return headerAuth.slice(7);
    }

    return undefined;
  }

  private extractRefreshToken(req: Request) {
    const cookieRecord = this.asCookieRecord(req.cookies);
    if (cookieRecord?.refresh_token) {
      return cookieRecord.refresh_token;
    }

    const headerCookie = req.headers?.cookie;
    if (!headerCookie) {
      return undefined;
    }

    const refreshCookie = headerCookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('refresh_token='));

    return refreshCookie?.split('=').slice(1).join('=');
  }

  private asCookieRecord(cookies: Request['cookies']) {
    if (!cookies || typeof cookies !== 'object') {
      return undefined;
    }

    return cookies as Record<string, string>;
  }
}
