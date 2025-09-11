"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapService = void 0;
const common_1 = require("@nestjs/common");
const imapflow_1 = require("imapflow");
const generic_pool_1 = require("generic-pool");
let ImapService = ImapService_1 = class ImapService {
    logger = new common_1.Logger(ImapService_1.name);
    pools = new Map();
    getPoolKey(config) {
        return `${config.host}:${config.port || (config.secure ? 993 : 143)}:${config.user || 'oauth'}`;
    }
    createClientOptions(config) {
        const auth = (() => {
            if (config.authMethod === 'OAUTH2' && config.accessToken) {
                return { auth: { user: config.user || '', accessToken: config.accessToken, method: 'XOAUTH2' } };
            }
            if (config.authMethod === 'PLAIN') {
                return { auth: { user: config.user || '', pass: config.pass || '', method: 'PLAIN' } };
            }
            return { auth: { user: config.user || '', pass: config.pass || '' } };
        })();
        return {
            host: config.host,
            port: config.port || (config.secure ? 993 : 143),
            secure: config.secure ?? true,
            logger: false,
            clientInfo: { name: 'LucidGrowth Sync', version: '1.0.0' },
            socketTimeout: 30000,
            disableAutoIdle: false,
            ...auth,
        };
    }
    getOrCreatePool(config) {
        const key = this.getPoolKey(config);
        if (this.pools.has(key))
            return this.pools.get(key);
        const factory = {
            create: async () => {
                const client = new imapflow_1.ImapFlow(this.createClientOptions(config));
                client.on('error', (e) => this.logger.warn(`IMAP error: ${String(e)}`));
                client.on('close', () => this.logger.warn('IMAP connection closed'));
                try {
                    await client.connect();
                    this.logger.log('IMAP connected successfully');
                    return client;
                }
                catch (e) {
                    this.logger.error(`IMAP connection failed: ${String(e)}`);
                    try {
                        await client.close();
                    }
                    catch { }
                    throw e;
                }
            },
            destroy: async (client) => {
                try {
                    if (client.usable) {
                        await client.logout();
                    }
                }
                catch (e) {
                    this.logger.warn(`Error on logout: ${String(e)}`);
                }
                try {
                    await client.close();
                }
                catch { }
            },
            validate: async (client) => {
                try {
                    return Boolean(client.usable && client.authenticated);
                }
                catch {
                    return false;
                }
            },
        };
        const pool = (0, generic_pool_1.createPool)(factory, {
            min: 0,
            max: 1,
            testOnBorrow: true,
            acquireTimeoutMillis: 60000,
            idleTimeoutMillis: 300000,
            evictionRunIntervalMillis: 30000,
            numTestsPerEvictionRun: 1,
        });
        pool.on('factoryCreateError', (err) => this.logger.error(`Pool create error: ${err}`));
        pool.on('factoryDestroyError', (err) => this.logger.error(`Pool destroy error: ${err}`));
        this.pools.set(key, pool);
        return pool;
    }
    async withClient(config, fn) {
        const maxRetries = 2;
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const pool = this.getOrCreatePool(config);
            let client = null;
            let clientDestroyed = false;
            try {
                client = await pool.acquire();
                if (!client.usable || !client.authenticated) {
                    throw new Error('IMAP client is not usable or authenticated');
                }
                const result = await fn(client);
                return result;
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`withClient attempt ${attempt + 1} failed: ${String(error)}`);
                if (client && (!client.usable || !client.authenticated)) {
                    try {
                        await pool.destroy(client);
                        clientDestroyed = true;
                    }
                    catch (destroyError) {
                        this.logger.warn(`Error destroying invalid client: ${String(destroyError)}`);
                        clientDestroyed = true;
                    }
                }
                if (attempt === maxRetries) {
                    throw lastError;
                }
                this.clearPool(config);
                await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            }
            finally {
                if (client && !clientDestroyed) {
                    try {
                        pool.release(client);
                    }
                    catch (releaseError) {
                        this.logger.warn(`Error releasing client: ${String(releaseError)}`);
                    }
                }
            }
        }
        throw lastError || new Error('Unknown error in withClient');
    }
    clearPool(config) {
        const key = this.getPoolKey(config);
        const pool = this.pools.get(key);
        if (pool) {
            this.logger.log(`Clearing IMAP pool for ${key}`);
            pool.drain().then(() => pool.clear());
            this.pools.delete(key);
        }
    }
};
exports.ImapService = ImapService;
exports.ImapService = ImapService = ImapService_1 = __decorate([
    (0, common_1.Injectable)()
], ImapService);
//# sourceMappingURL=imap.service.js.map