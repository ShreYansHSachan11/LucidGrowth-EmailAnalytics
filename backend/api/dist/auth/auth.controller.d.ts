import type { Response } from 'express';
import { GoogleOAuthService } from './google-oauth.service';
import { SyncService } from '../sync.service';
export declare class AuthController {
    private readonly googleOAuthService;
    private readonly syncService;
    constructor(googleOAuthService: GoogleOAuthService, syncService: SyncService);
    getGoogleAuthUrl(): {
        authUrl: string;
        error?: undefined;
        details?: undefined;
    } | {
        error: string;
        details: string;
        authUrl?: undefined;
    };
    handleGoogleCallback(code: string, error: string, res: Response): Promise<void>;
}
