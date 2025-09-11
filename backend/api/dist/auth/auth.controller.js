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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const google_oauth_service_1 = require("./google-oauth.service");
const sync_service_1 = require("../sync.service");
let AuthController = class AuthController {
    googleOAuthService;
    syncService;
    constructor(googleOAuthService, syncService) {
        this.googleOAuthService = googleOAuthService;
        this.syncService = syncService;
    }
    getGoogleAuthUrl() {
        try {
            const authUrl = this.googleOAuthService.getAuthUrl();
            return { authUrl };
        }
        catch (error) {
            return {
                error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
                details: String(error)
            };
        }
    }
    async handleGoogleCallback(code, error, res) {
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
        }
        catch (e) {
            return res.redirect(`http://localhost:3000/setup?error=${encodeURIComponent(String(e))}`);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getGoogleAuthUrl", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('error')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleGoogleCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [google_oauth_service_1.GoogleOAuthService,
        sync_service_1.SyncService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map