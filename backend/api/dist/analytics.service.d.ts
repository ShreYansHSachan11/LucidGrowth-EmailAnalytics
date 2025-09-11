import { Model } from 'mongoose';
import { EmailDocument } from './emails/schemas/email.schema';
export declare class AnalyticsService {
    private readonly emailModel;
    constructor(emailModel: Model<EmailDocument>);
    getSummary(): Promise<{
        byEsp: any[];
        byDomain: any[];
    }>;
}
