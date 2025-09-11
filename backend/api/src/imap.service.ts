import { Injectable, Logger } from '@nestjs/common';
import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { createPool, Pool } from 'generic-pool';

export type ImapAuthMethod = 'OAUTH2' | 'PLAIN' | 'LOGIN';

export interface ImapConnectionConfig {
  host: string;
  port?: number;
  secure?: boolean;
  authMethod?: ImapAuthMethod;
  user?: string;
  pass?: string;
  accessToken?: string; // for OAUTH2
  clientId?: string; // reserved
  clientSecret?: string; // reserved
}

@Injectable()
export class ImapService {
  private readonly logger = new Logger(ImapService.name);
  private readonly pools = new Map<string, Pool<ImapFlow>>();

  private getPoolKey(config: ImapConnectionConfig): string {
    return `${config.host}:${config.port || (config.secure ? 993 : 143)}:${config.user || 'oauth'}`;
  }

  createClientOptions(config: ImapConnectionConfig): ImapFlowOptions {
    const auth = (() => {
      if (config.authMethod === 'OAUTH2' && config.accessToken) {
        return { auth: { user: config.user || '', accessToken: config.accessToken, method: 'XOAUTH2' as const } };
      }
      if (config.authMethod === 'PLAIN') {
        return { auth: { user: config.user || '', pass: config.pass || '', method: 'PLAIN' as const } };
      }
      return { auth: { user: config.user || '', pass: config.pass || '' } };
    })();

    return {
      host: config.host,
      port: config.port || (config.secure ? 993 : 143),
      secure: config.secure ?? true,
      logger: false,
      clientInfo: { name: 'LucidGrowth Sync', version: '1.0.0' },
      // Conservative timeouts
      socketTimeout: 30000,
      // Connection stability
      disableAutoIdle: false,
      ...auth,
    } as ImapFlowOptions;
  }

  getOrCreatePool(config: ImapConnectionConfig): Pool<ImapFlow> {
    const key = this.getPoolKey(config);
    if (this.pools.has(key)) return this.pools.get(key)!;

    const factory = {
      create: async () => {
        const client = new ImapFlow(this.createClientOptions(config));
        client.on('error', (e) => this.logger.warn(`IMAP error: ${String(e)}`));
        client.on('close', () => this.logger.warn('IMAP connection closed'));
        
        try {
          await client.connect();
          this.logger.log('IMAP connected successfully');
          return client;
        } catch (e) {
          this.logger.error(`IMAP connection failed: ${String(e)}`);
          // Clean up the failed client
          try {
            await client.close();
          } catch {}
          throw e;
        }
      },
      destroy: async (client: ImapFlow) => {
        try {
          if (client.usable) {
            await client.logout();
          }
        } catch (e) {
          this.logger.warn(`Error on logout: ${String(e)}`);
        }
        try {
          await client.close();
        } catch {}
      },
      validate: async (client: ImapFlow): Promise<boolean> => {
        try {
          return Boolean(client.usable && client.authenticated);
        } catch {
          return false;
        }
      },
    };

    const pool = createPool(factory, {
      min: 0,
      max: 1, // Use only 1 connection per account to avoid conflicts
      testOnBorrow: true,
      acquireTimeoutMillis: 60000, // 60 seconds
      idleTimeoutMillis: 300000, // 5 minutes
      evictionRunIntervalMillis: 30000, // 30 seconds
      numTestsPerEvictionRun: 1,
    });

    pool.on('factoryCreateError', (err) => this.logger.error(`Pool create error: ${err}`));
    pool.on('factoryDestroyError', (err) => this.logger.error(`Pool destroy error: ${err}`));

    this.pools.set(key, pool);
    return pool;
  }


  async withClient<T>(config: ImapConnectionConfig, fn: (client: ImapFlow) => Promise<T>): Promise<T> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const pool = this.getOrCreatePool(config);
      let client: ImapFlow | null = null;
      let clientDestroyed = false;
      
      try {
        client = await pool.acquire();
        if (!client.usable || !client.authenticated) {
          throw new Error('IMAP client is not usable or authenticated');
        }
        const result = await fn(client);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`withClient attempt ${attempt + 1} failed: ${String(error)}`);
        
        // If client is invalid, destroy it
        if (client && (!client.usable || !client.authenticated)) {
          try {
            await pool.destroy(client);
            clientDestroyed = true;
          } catch (destroyError) {
            this.logger.warn(`Error destroying invalid client: ${String(destroyError)}`);
            clientDestroyed = true; // Assume destroyed even if error
          }
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Clear the pool and wait before retrying
        this.clearPool(config);
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
      } finally {
        // Only release if client wasn't destroyed
        if (client && !clientDestroyed) {
          try {
            pool.release(client);
          } catch (releaseError) {
            this.logger.warn(`Error releasing client: ${String(releaseError)}`);
          }
        }
      }
    }
    
    throw lastError || new Error('Unknown error in withClient');
  }

  clearPool(config: ImapConnectionConfig) {
    const key = this.getPoolKey(config);
    const pool = this.pools.get(key);
    if (pool) {
      this.logger.log(`Clearing IMAP pool for ${key}`);
      pool.drain().then(() => pool.clear());
      this.pools.delete(key);
    }
  }
}
