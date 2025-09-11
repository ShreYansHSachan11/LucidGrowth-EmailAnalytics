import { EmailsService } from './emails.service';
export declare class EmailsController {
    private readonly emailsService;
    constructor(emailsService: EmailsService);
    findAll(limit?: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./emails/schemas/email.schema").Email, {}, {}> & import("./emails/schemas/email.schema").Email & {
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
    findByFolder(path: string, account?: string, limit?: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./emails/schemas/email.schema").Email, {}, {}> & import("./emails/schemas/email.schema").Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findOne(id: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./emails/schemas/email.schema").Email, {}, {}> & import("./emails/schemas/email.schema").Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    updateFlags(id: string, body: {
        seen?: boolean;
        flagged?: boolean;
        answered?: boolean;
        draft?: boolean;
        deleted?: boolean;
    }): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./emails/schemas/email.schema").Email, {}, {}> & import("./emails/schemas/email.schema").Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
}
