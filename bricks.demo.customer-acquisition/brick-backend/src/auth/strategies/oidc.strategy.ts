import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-openidconnect';

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  constructor() {
    super({
      issuer: process.env.OIDC_ISSUER!,
      authorizationURL: process.env.OIDC_AUTH_URL!,
      tokenURL: process.env.OIDC_TOKEN_URL!,
      userInfoURL: process.env.OIDC_USERINFO_URL!,
      clientID: process.env.OIDC_CLIENT_ID!,
      clientSecret: process.env.OIDC_CLIENT_SECRET!,
      callbackURL: process.env.OIDC_CALLBACK_URL!,
      scope: 'openid profile email',
    });
  }

  async validate(issuer, subject, profile) {
    return {
      id: subject,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
    };
  }
}
