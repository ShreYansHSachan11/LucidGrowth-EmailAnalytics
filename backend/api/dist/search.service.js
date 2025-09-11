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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schema_1 = require("./emails/schemas/email.schema");
let SearchService = class SearchService {
    emailModel;
    constructor(emailModel) {
        this.emailModel = emailModel;
    }
    async searchEmails(query) {
        if (!query)
            return [];
        const textResults = await this.emailModel
            .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(100)
            .lean();
        if (textResults.length > 0)
            return textResults;
        const rx = new RegExp(this.escapeRegex(query), 'i');
        return this.emailModel
            .find({ $or: [{ from: rx }, { to: rx }, { 'analytics.sendingDomain': rx }] })
            .limit(100)
            .lean();
    }
    escapeRegex(input) {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_schema_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SearchService);
//# sourceMappingURL=search.service.js.map