import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GoogleOAuthService } from './google-oauth.service';
import { SyncService } from '../sync.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly syncService: SyncService,
  ) {}

  @Get('google')
  getGoogleAuthUrl() {
    try {
      const authUrl = this.googleOAuthService.getAuthUrl();
      return { authUrl };
    } catch (error) {
      return { 
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
        details: String(error)
      };
    }
  }

  @Get('google/callback')
  async handleGoogleCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      return res.redirect(`http://localhost:3000/setup?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect('http://localhost:3000/setup?error=No authorization code received');
    }

    try {
      const tokens = await this.googleOAuthService.exchangeCodeForToken(code);
      const email = await this.googleOAuthService.getUserEmail(tokens.access_token);

      await this.syncService.startSync({
        source: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true,
          authMethod: 'OAUTH2',
          user: email || 'me',
          accessToken: tokens.access_token,
        },
      });

      return res.redirect(`http://localhost:3000/?success=${encodeURIComponent('Gmail connected successfully')}`);
    } catch (e) {
      return res.redirect(`http://localhost:3000/setup?error=${encodeURIComponent(String(e))}`);
    }
  }
}
