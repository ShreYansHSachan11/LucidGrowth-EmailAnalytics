import { ImapService, ImapConnectionConfig } from './imap.service';
import { Model } from 'mongoose';
import { EmailDocument } from './emails/schemas/email.schema';
export declare class SyncService {
    private readonly imapService;
    private readonly emailModel;
    private readonly logger;
    private paused;
    private currentStatus;
    constructor(imapService: ImapService, emailModel: Model<EmailDocument>);
    pause(): {
        status: string;
    };
    resume(): {
        status: string;
    };
    startSync(payload: {
        source: ImapConnectionConfig;
        folders?: string[];
        account?: string;
    }): Promise<{
        status: string;
    }>;
    private computeAnalytics;
    private detectEsp;
    private lookupMx;
    private checkSmtpSecurity;
    getStatus(): {
        account?: string;
        folderPath?: string;
        running: boolean;
    };
}
