"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const emails_module_1 = require("./emails/emails.module");
const emails_controller_1 = require("./emails.controller");
const emails_service_1 = require("./emails.service");
const imap_module_1 = require("./imap/imap.module");
const imap_service_1 = require("./imap.service");
const sync_module_1 = require("./sync/sync.module");
const sync_service_1 = require("./sync.service");
const sync_controller_1 = require("./sync.controller");
const analytics_module_1 = require("./analytics/analytics.module");
const search_module_1 = require("./search/search.module");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lucidgrowth', {
                dbName: process.env.MONGO_DB || 'lucidgrowth',
                serverSelectionTimeoutMS: 5000,
            }),
            emails_module_1.EmailsModule,
            imap_module_1.ImapModule,
            sync_module_1.SyncModule,
            analytics_module_1.AnalyticsModule,
            search_module_1.SearchModule,
            auth_module_1.AuthModule,
        ],
        controllers: [
            app_controller_1.AppController,
            emails_controller_1.EmailsController,
            sync_controller_1.SyncController,
        ],
        providers: [
            app_service_1.AppService,
            emails_service_1.EmailsService,
            imap_service_1.ImapService,
            sync_service_1.SyncService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map