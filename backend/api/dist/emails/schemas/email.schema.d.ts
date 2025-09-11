import { HydratedDocument } from 'mongoose';
export type EmailDocument = HydratedDocument<Email>;
export declare class Email {
    account: string;
    messageId: string;
    folderPath: string;
    uid?: number;
    uidValidity?: number;
    from: string[];
    to: string[];
    cc?: string[];
    subject?: string;
    date?: Date;
    headers?: Record<string, any>;
    flags?: {
        seen?: boolean;
        answered?: boolean;
        flagged?: boolean;
        deleted?: boolean;
        draft?: boolean;
    };
    analytics?: {
        sender?: string;
        sendingDomain?: string;
        esp?: string;
        sentToReceivedDeltaMs?: number;
        sendingServer?: string;
        openRelay?: boolean;
        tlsSupported?: boolean;
        tlsValidCert?: boolean;
    };
    text?: string;
    html?: string;
    attachments?: string[];
}
export declare const EmailSchema: import("mongoose").Schema<Email, import("mongoose").Model<Email, any, any, any, import("mongoose").Document<unknown, any, Email, any, {}> & Email & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Email, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Email>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Email> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
