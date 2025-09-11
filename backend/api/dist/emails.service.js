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
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schema_1 = require("./emails/schemas/email.schema");
let EmailsService = class EmailsService {
    emailModel;
    constructor(emailModel) {
        this.emailModel = emailModel;
    }
    async findAll(limit = 50) {
        return this.emailModel
            .find()
            .sort({ date: -1 })
            .limit(limit)
            .lean();
    }
    async listFolders(account) {
        const match = {};
        if (account)
            match.account = account;
        const results = await this.emailModel.aggregate([
            { $match: match },
            { $group: { _id: '$folderPath', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        return results.map((r) => ({ folderPath: r._id, count: r.count }));
    }
    async findByFolder(folderPath, account, limit = 50) {
        const query = { folderPath };
        if (account)
            query.account = account;
        return this.emailModel
            .find(query)
            .sort({ date: -1 })
            .limit(limit)
            .lean();
    }
    async findById(id) {
        return this.emailModel.findById(id).lean();
    }
    async updateFlags(id, flags) {
        const toSet = {};
        if (typeof flags.seen === 'boolean')
            toSet['flags.seen'] = flags.seen;
        if (typeof flags.answered === 'boolean')
            toSet['flags.answered'] = flags.answered;
        if (typeof flags.flagged === 'boolean')
            toSet['flags.flagged'] = flags.flagged;
        if (typeof flags.deleted === 'boolean')
            toSet['flags.deleted'] = flags.deleted;
        if (typeof flags.draft === 'boolean')
            toSet['flags.draft'] = flags.draft;
        await this.emailModel.updateOne({ _id: id }, { $set: toSet });
        return this.emailModel.findById(id).lean();
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_schema_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailsService);
//# sourceMappingURL=emails.service.js.map