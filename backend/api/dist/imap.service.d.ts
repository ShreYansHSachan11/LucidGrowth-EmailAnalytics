import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { Pool } from 'generic-pool';
export type ImapAuthMethod = 'OAUTH2' | 'PLAIN' | 'LOGIN';
export interface ImapConnectionConfig {
    host: string;
    port?: number;
    secure?: boolean;
    authMethod?: ImapAuthMethod;
    user?: string;
    pass?: string;
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
}
export declare class ImapService {
    private readonly logger;
    private readonly pools;
    private getPoolKey;
    createClientOptions(config: ImapConnectionConfig): ImapFlowOptions;
    getOrCreatePool(config: ImapConnectionConfig): Pool<ImapFlow>;
    withClient<T>(config: ImapConnectionConfig, fn: (client: ImapFlow) => Promise<T>): Promise<T>;
    clearPool(config: ImapConnectionConfig): void;
}
