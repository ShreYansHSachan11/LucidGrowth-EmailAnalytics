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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSchema = exports.Email = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Email = class Email {
    account;
    messageId;
    folderPath;
    uid;
    uidValidity;
    from;
    to;
    cc;
    subject;
    date;
    headers;
    flags;
    analytics;
    text;
    html;
    attachments;
};
exports.Email = Email;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Email.prototype, "account", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Email.prototype, "messageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Email.prototype, "folderPath", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, index: true }),
    __metadata("design:type", Number)
], Email.prototype, "uid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Email.prototype, "uidValidity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], index: true }),
    __metadata("design:type", Array)
], Email.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], index: true }),
    __metadata("design:type", Array)
], Email.prototype, "to", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Email.prototype, "cc", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Email.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", Date)
], Email.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Email.prototype, "headers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Email.prototype, "flags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Email.prototype, "analytics", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Email.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Email.prototype, "html", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Email.prototype, "attachments", void 0);
exports.Email = Email = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'emails' })
], Email);
exports.EmailSchema = mongoose_1.SchemaFactory.createForClass(Email);
exports.EmailSchema.index({ subject: 'text', text: 'text', html: 'text', from: 'text', to: 'text', 'analytics.sendingDomain': 'text' }, { weights: { subject: 10, text: 8, html: 2, from: 6, to: 4, 'analytics.sendingDomain': 5 } });
exports.EmailSchema.index({ account: 1, folderPath: 1, uidValidity: 1, uid: 1 });
//# sourceMappingURL=email.schema.js.map