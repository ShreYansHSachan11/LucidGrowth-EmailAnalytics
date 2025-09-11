import { Model } from 'mongoose';
import { Email, EmailDocument } from './emails/schemas/email.schema';
export declare class SearchService {
    private readonly emailModel;
    constructor(emailModel: Model<EmailDocument>);
    searchEmails(query: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email, {}, {}> & Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    private escapeRegex;
}
