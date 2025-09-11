import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchEmails(q: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./emails/schemas/email.schema").Email, {}, {}> & import("./emails/schemas/email.schema").Email & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
}
