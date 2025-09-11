import { ConfigService } from '@nestjs/config';
export declare class GoogleOAuthService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getAuthUrl(): string;
    exchangeCodeForToken(code: string): Promise<{
        access_token: string;
        refresh_token?: string;
        id_token?: string;
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    getUserEmail(accessToken: string): Promise<string | undefined>;
}
