import { SyncService } from './sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    start(body: any): Promise<{
        status: string;
    }>;
    pause(): {
        status: string;
    };
    resume(): {
        status: string;
    };
    status(): {
        account?: string;
        folderPath?: string;
        running: boolean;
    };
}
