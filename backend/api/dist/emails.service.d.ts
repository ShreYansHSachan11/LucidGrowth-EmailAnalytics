import { Model } from 'mongoose';
import { Email, EmailDocument } from './emails/schemas/email.schema';
export declare class EmailsService {
    private readonly emailModel;
    constructor(emailModel: Model<EmailDocument>);
    findAll(limit?: number): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email, {}, {}> & Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    listFolders(account?: string): Promise<{
        folderPath: string;
        count: number;
    }[]>;
    findByFolder(folderPath: string, account?: string, limit?: number): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email, {}, {}> & Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findById(id: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email, {}, {}> & Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    updateFlags(id: string, flags: Partial<NonNullable<Email['flags']>>): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email, {}, {}> & Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
}
