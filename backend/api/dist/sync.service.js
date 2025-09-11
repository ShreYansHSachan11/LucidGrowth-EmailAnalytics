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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const imap_service_1 = require("./imap.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schema_1 = require("./emails/schemas/email.schema");
const dayjs_1 = __importDefault(require("dayjs"));
const mailparser_1 = require("mailparser");
const dns_1 = require("dns");
let SyncService = SyncService_1 = class SyncService {
    imapService;
    emailModel;
    logger = new common_1.Logger(SyncService_1.name);
    paused = false;
    currentStatus = { running: false };
    constructor(imapService, emailModel) {
        this.imapService = imapService;
        this.emailModel = emailModel;
    }
    pause() {
        this.paused = true;
        return { status: 'paused' };
    }
    resume() {
        this.paused = false;
        return { status: 'resumed' };
    }
    async startSync(payload) {
        const { source, folders } = payload;
        const account = payload.account || source.user || 'unknown';
        try {
            this.currentStatus = { account, running: true };
            await this.imapService.withClient(source, async (client) => {
                const mailboxes = [];
                const listResult = await client.list();
                for (const box of listResult) {
                    if (folders && folders.length > 0 && !folders.includes(box.path))
                        continue;
                    mailboxes.push({ path: box.path });
                }
                for (const box of mailboxes) {
                    const lock = await client.getMailboxLock(box.path);
                    try {
                        this.currentStatus.folderPath = box.path;
                        const mailbox = await client.mailboxOpen(box.path, { readOnly: true });
                        const uidValidity = Number(mailbox.uidValidity);
                        const last = await this.emailModel
                            .find({ account, folderPath: box.path, uidValidity })
                            .sort({ uid: -1 })
                            .limit(1)
                            .lean();
                        const lastUid = last[0]?.uid || 0;
                        let remainingCapacity = null;
                        const fetchBatches = [];
                        if (lastUid > 0) {
                            fetchBatches.push({ from: String(lastUid + 1), to: '*' });
                        }
                        else {
                            const existingCount = await this.emailModel.countDocuments({ account, folderPath: box.path });
                            remainingCapacity = Math.max(0, 100 - existingCount);
                            const status = await client.status(box.path, { highestModseq: false, messages: true, uidNext: true });
                            const uidNext = Number(status.uidNext || 1);
                            const newestUid = uidNext > 0 ? uidNext - 1 : 0;
                            const batchSize = 200;
                            for (let start = newestUid; start >= 1; start -= batchSize) {
                                const end = Math.max(1, start - batchSize + 1);
                                fetchBatches.push({ from: String(end), to: String(start) });
                            }
                        }
                        outer: for (const batch of fetchBatches) {
                            for await (const message of client.fetch(`${batch.from}:${batch.to}`, {
                                uid: true,
                                envelope: true,
                                source: true,
                                flags: true,
                                bodyStructure: true,
                                internalDate: true,
                            })) {
                                if (remainingCapacity !== null && remainingCapacity <= 0) {
                                    break outer;
                                }
                                if (this.paused) {
                                    await new Promise((r) => setTimeout(r, 500));
                                    continue;
                                }
                                const from = (message.envelope?.from || []).map((a) => `${a.name || ''} <${a.address || ''}>`.trim());
                                const to = (message.envelope?.to || []).map((a) => `${a.name || ''} <${a.address || ''}>`.trim());
                                const cc = (message.envelope?.cc || []).map((a) => `${a.name || ''} <${a.address || ''}>`.trim());
                                let text;
                                let html;
                                let parsed;
                                try {
                                    if (message.source) {
                                        parsed = await (0, mailparser_1.simpleParser)(message.source);
                                        text = parsed.text || undefined;
                                        html = parsed.html ? (typeof parsed.html === 'string' ? parsed.html : parsed.html?.toString()) : undefined;
                                    }
                                }
                                catch { }
                                const senderAddress = message.envelope?.from?.[0]?.address || '';
                                const sendingDomain = senderAddress.split('@')[1] || '';
                                const analytics = await this.computeAnalytics(senderAddress, sendingDomain, message, parsed);
                                const headersObject = (() => {
                                    if (!parsed?.headers)
                                        return undefined;
                                    try {
                                        const obj = {};
                                        const hdrs = parsed.headers;
                                        if (typeof hdrs.forEach === 'function') {
                                            hdrs.forEach((value, key) => {
                                                obj[String(key)] = value;
                                            });
                                            return obj;
                                        }
                                        if (typeof hdrs.entries === 'function') {
                                            for (const [key, value] of hdrs.entries()) {
                                                obj[String(key)] = value;
                                            }
                                            return obj;
                                        }
                                        return undefined;
                                    }
                                    catch {
                                        return undefined;
                                    }
                                })();
                                await this.emailModel.updateOne({ account, messageId: message.envelope?.messageId || String(message.uid) }, {
                                    $set: {
                                        account,
                                        messageId: message.envelope?.messageId || String(message.uid),
                                        folderPath: box.path,
                                        uid: Number(message.uid),
                                        uidValidity,
                                        from,
                                        to,
                                        cc,
                                        subject: message.envelope?.subject,
                                        date: (() => {
                                            const sent = message.envelope?.date ? (0, dayjs_1.default)(message.envelope.date) : undefined;
                                            const internal = message.internalDate ? (0, dayjs_1.default)(message.internalDate) : undefined;
                                            if (sent && sent.isValid())
                                                return sent.toDate();
                                            if (internal && internal.isValid())
                                                return internal.toDate();
                                            return undefined;
                                        })(),
                                        headers: headersObject,
                                        flags: {
                                            seen: message.flags?.has('\\Seen') || false,
                                            answered: message.flags?.has('Answered') || false,
                                            flagged: message.flags?.has('Flagged') || false,
                                            deleted: message.flags?.has('Deleted') || false,
                                            draft: message.flags?.has('Draft') || false,
                                        },
                                        text,
                                        html,
                                        analytics,
                                    },
                                }, { upsert: true });
                                if (remainingCapacity !== null) {
                                    remainingCapacity -= 1;
                                }
                            }
                        }
                        const idsToRemove = await this.emailModel
                            .find({ account, folderPath: box.path })
                            .sort({ date: -1, _id: -1 })
                            .skip(100)
                            .select({ _id: 1 })
                            .lean();
                        if (idsToRemove.length > 0) {
                            await this.emailModel.deleteMany({ _id: { $in: idsToRemove.map((d) => d._id) } });
                        }
                    }
                    finally {
                        lock.release();
                    }
                }
            });
        }
        catch (error) {
            this.logger.error(`Sync failed: ${String(error)}`);
            this.imapService.clearPool(source);
            const errorMessage = String(error);
            if (errorMessage.includes('Command failed') || errorMessage.includes('Authentication failed')) {
                throw new Error(`Authentication failed. Please check:
1. Enable 2-Factor Authentication in your Gmail account
2. Generate an App Password (not your regular password)
3. Use the App Password in the setup form
4. Ensure IMAP is enabled in Gmail settings`);
            }
            else if (errorMessage.includes('Connection refused') || errorMessage.includes('ECONNREFUSED')) {
                throw new Error(`Connection failed. Please check:
1. Your internet connection
2. IMAP server settings (imap.gmail.com:993)
3. Firewall/antivirus blocking the connection`);
            }
            else {
                throw new Error(`Email sync failed: ${errorMessage}`);
            }
        }
        this.currentStatus = { running: false };
        return { status: 'completed' };
    }
    async computeAnalytics(sender, domain, message, parsed) {
        const esp = await this.detectEsp(domain, parsed);
        const receivedHeaders = parsed?.headers?.get('received') || [];
        const receivedArray = Array.isArray(receivedHeaders) ? receivedHeaders : receivedHeaders ? [receivedHeaders] : [];
        const receivedDates = receivedArray
            .map((h) => {
            const m = h.match(/;\s*(.+)$/);
            return m ? (0, dayjs_1.default)(m[1]) : undefined;
        })
            .filter((d) => d && d.isValid());
        const sentDate = (0, dayjs_1.default)(parsed?.date || message.envelope?.date || message.internalDate);
        const receivedDate = receivedDates.length > 0 ? receivedDates[receivedDates.length - 1] : (0, dayjs_1.default)(message.internalDate);
        const sentToReceivedDeltaMs = receivedDate.diff(sentDate);
        const sendingServer = await this.lookupMx(domain);
        const { openRelay, tlsSupported, tlsValidCert } = await this.checkSmtpSecurity(domain);
        return {
            sender,
            sendingDomain: domain,
            esp,
            sentToReceivedDeltaMs,
            sendingServer,
            openRelay,
            tlsSupported,
            tlsValidCert,
        };
    }
    async detectEsp(domain, parsed) {
        const map = {
            'gmail.com': 'Gmail/Google Workspace',
            'outlook.com': 'Outlook/Office365',
            'yahoo.com': 'Yahoo',
            'zoho.com': 'Zoho Mail',
            'mailgun.org': 'Mailgun',
            'sendgrid.net': 'SendGrid',
            'amazonses.com': 'Amazon SES',
        };
        if (map[domain])
            return map[domain];
        const xMailer = parsed?.headers?.get('x-mailer') || '';
        if (/sendgrid/i.test(xMailer))
            return 'SendGrid';
        if (/ses|amazon/i.test(xMailer))
            return 'Amazon SES';
        const received = parsed?.headers?.get('received') || [];
        const receivedArr = Array.isArray(received) ? received : received ? [received] : [];
        const receivedStr = receivedArr.join(' ');
        if (/sendgrid\.net/i.test(receivedStr))
            return 'SendGrid';
        if (/amazonses\.com|ses\.amazonaws\.com/i.test(receivedStr))
            return 'Amazon SES';
        if (/mailgun\.org/i.test(receivedStr))
            return 'Mailgun';
        return 'Unknown';
    }
    async lookupMx(domain) {
        try {
            const records = await dns_1.promises.resolveMx(domain);
            records.sort((a, b) => a.priority - b.priority);
            return records[0]?.exchange;
        }
        catch {
            return undefined;
        }
    }
    async checkSmtpSecurity(domain) {
        const mx = await this.lookupMx(domain);
        const tlsSupported = Boolean(mx);
        const tlsValidCert = Boolean(mx);
        const openRelay = false;
        return { openRelay, tlsSupported, tlsValidCert };
    }
    getStatus() {
        return { ...this.currentStatus };
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(email_schema_1.Email.name)),
    __metadata("design:paramtypes", [imap_service_1.ImapService,
        mongoose_2.Model])
], SyncService);
//# sourceMappingURL=sync.service.js.map