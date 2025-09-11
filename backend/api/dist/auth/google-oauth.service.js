"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleOAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GoogleOAuthService = GoogleOAuthService_1 = class GoogleOAuthService {
    configService;
    logger = new common_1.Logger(GoogleOAuthService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    getAuthUrl() {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI') || 'http://localhost:3001/auth/google/callback';
        if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID not configured');
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'https://mail.google.com/ openid email',
            access_type: 'offline',
            prompt: 'consent',
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    async exchangeCodeForToken(code) {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI') || 'http://localhost:3001/auth/google/callback';
        if (!clientId || !clientSecret) {
            throw new Error('Google OAuth credentials not configured');
        }
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token exchange failed: ${error}`);
        }
        const data = await response.json();
        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            id_token: data.id_token,
        };
    }
    async refreshAccessToken(refreshToken) {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
            throw new Error('Google OAuth credentials not configured');
        }
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token refresh failed: ${error}`);
        }
        const data = await response.json();
        return { access_token: data.access_token };
    }
    async getUserEmail(accessToken) {
        try {
            const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok)
                return undefined;
            const data = await res.json();
            return data.email;
        }
        catch (e) {
            this.logger.warn(`Failed to fetch userinfo: ${String(e)}`);
            return undefined;
        }
    }
};
exports.GoogleOAuthService = GoogleOAuthService;
exports.GoogleOAuthService = GoogleOAuthService = GoogleOAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleOAuthService);
//# sourceMappingURL=google-oauth.service.js.map