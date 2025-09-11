import { Injectable, Logger } from '@nestjs/common';
import { ImapService, ImapConnectionConfig } from './imap.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './emails/schemas/email.schema';
import dayjs from 'dayjs';
import { simpleParser, ParsedMail } from 'mailparser';
import { promises as dns } from 'dns';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private paused = false;
  private currentStatus: { account?: string; folderPath?: string; running: boolean } = { running: false };

  constructor(
    private readonly imapService: ImapService,
    @InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>,
  ) {}

  pause() {
    this.paused = true;
    return { status: 'paused' };
  }

  resume() {
    this.paused = false;
    return { status: 'resumed' };
  }

  async startSync(payload: {
    source: ImapConnectionConfig;
    folders?: string[];
    account?: string; // explicit account id/email. Defaults to source.user
  }) {
    const { source, folders } = payload;
    const account = payload.account || source.user || 'unknown';

    try {
      this.currentStatus = { account, running: true };
      await this.imapService.withClient(source, async (client) => {
      const mailboxes: { path: string }[] = [];
      const listResult = await client.list();
      for (const box of listResult) {
        if (folders && folders.length > 0 && !folders.includes(box.path)) continue;
        mailboxes.push({ path: box.path });
      }

      for (const box of mailboxes) {
        const lock = await client.getMailboxLock(box.path);
        try {
          this.currentStatus.folderPath = box.path;
          const mailbox = await client.mailboxOpen(box.path, { readOnly: true });
          const uidValidity = Number(mailbox.uidValidity); // Convert BigInt to Number

          const last = await this.emailModel
            .find({ account, folderPath: box.path, uidValidity })
            .sort({ uid: -1 })
            .limit(1)
            .lean();
          const lastUid = last[0]?.uid || 0;

          // For initial backfill (no lastUid), we cap to 100 per account during first run.
          // For incremental syncs (lastUid > 0), always ingest new and prune oldest to keep 100.
          let remainingCapacity: number | null = null;

          // If we have synced before, continue forward; otherwise, fetch recent first
          // For initial sync (no lastUid), fetch newest ~200 first then earlier in chunks
          const fetchBatches: Array<{ from: string; to: string }> = [];
          if (lastUid > 0) {
            fetchBatches.push({ from: String(lastUid + 1), to: '*' });
          } else {
            const existingCount = await this.emailModel.countDocuments({ account, folderPath: box.path });
            remainingCapacity = Math.max(0, 100 - existingCount);
            // Determine the highest UID in the mailbox to start from the newest
            const status = await client.status(box.path, { highestModseq: false, messages: true, uidNext: true });
            const uidNext = Number(status.uidNext || 1);
            const newestUid = uidNext > 0 ? uidNext - 1 : 0;
            const batchSize = 200;
            for (let start = newestUid; start >= 1; start -= batchSize) {
              const end = Math.max(1, start - batchSize + 1);
              fetchBatches.push({ from: String(end), to: String(start) });
            }
          }

          outer: for (const batch of fetchBatches) {
          for await (const message of client.fetch(`${batch.from}:${batch.to}`, {
            uid: true,
            envelope: true,
            source: true,
            flags: true,
            bodyStructure: true,
            internalDate: true,
          })) {
            if (remainingCapacity !== null && remainingCapacity <= 0) {
              break outer;
            }
            if (this.paused) {
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }
            const from = (message.envelope?.from || []).map((a) => `${a.name || ''} <${a.address || ''}>`.trim());
            const to = (message.envelope?.to || []).map((a) => `${a.name || ''} <${a.address || ''}>`.trim());
            const cc = (message.envelope?.cc || []).map((a) => `${a.name || ''} <${a.address || ''}>`.trim());

            let text: string | undefined;
            let html: string | undefined;
            let parsed: ParsedMail | undefined;
            try {
              if (message.source) {
                parsed = await simpleParser(message.source as any);
                text = parsed.text || undefined;
                html = parsed.html ? (typeof parsed.html === 'string' ? parsed.html : parsed.html?.toString()) : undefined;
              }
            } catch {}

            const senderAddress = message.envelope?.from?.[0]?.address || '';
            const sendingDomain = senderAddress.split('@')[1] || '';

            const analytics = await this.computeAnalytics(senderAddress, sendingDomain, message, parsed);

            // Convert parsed headers to a plain object when available
            const headersObject: Record<string, any> | undefined = (() => {
              if (!parsed?.headers) return undefined;
              try {
                const obj: Record<string, any> = {};
                const hdrs: any = parsed.headers as any;
                if (typeof hdrs.forEach === 'function') {
                  hdrs.forEach((value: any, key: any) => {
                    obj[String(key)] = value;
                  });
                  return obj;
                }
                if (typeof hdrs.entries === 'function') {
                  for (const [key, value] of hdrs.entries() as Iterable<[string, any]>) {
                    obj[String(key)] = value;
                  }
                  return obj;
                }
                return undefined;
              } catch {
                return undefined;
              }
            })();

            await this.emailModel.updateOne(
              { account, messageId: message.envelope?.messageId || String(message.uid) },
              {
                $set: {
                  account,
                  messageId: message.envelope?.messageId || String(message.uid),
                  folderPath: box.path,
                  uid: Number(message.uid), // Convert BigInt to Number
                  uidValidity,
                  from,
                  to,
                  cc,
                  subject: message.envelope?.subject,
                  // Prefer the actual sent date if available, then internal date
                  date: (() => {
                    const sent = message.envelope?.date ? dayjs(message.envelope.date) : undefined;
                    const internal = message.internalDate ? dayjs(message.internalDate) : undefined;
                    if (sent && sent.isValid()) return sent.toDate();
                    if (internal && internal.isValid()) return internal.toDate();
                    return undefined;
                  })(),
                  headers: headersObject,
                  flags: {
                    seen: message.flags?.has('\\Seen') || false,
                    answered: message.flags?.has('Answered') || false,
                    flagged: message.flags?.has('Flagged') || false,
                    deleted: message.flags?.has('Deleted') || false,
                    draft: message.flags?.has('Draft') || false,
                  },
                  text,
                  html,
                  analytics,
                },
              },
              { upsert: true },
            );
            if (remainingCapacity !== null) {
              remainingCapacity -= 1;
            }
          }
          }

          // Enforce cap: keep only most recent 100 emails per account+folder
          const idsToRemove = await this.emailModel
            .find({ account, folderPath: box.path })
            .sort({ date: -1, _id: -1 })
            .skip(100)
            .select({ _id: 1 })
            .lean();
          if (idsToRemove.length > 0) {
            await this.emailModel.deleteMany({ _id: { $in: idsToRemove.map((d: any) => d._id) } });
          }
        } finally {
          lock.release();
        }
      }
      });
    } catch (error) {
      this.logger.error(`Sync failed: ${String(error)}`);
      // Clear the pool to force reconnection on next attempt
      this.imapService.clearPool(source);
      
      // Provide more helpful error messages
      const errorMessage = String(error);
      if (errorMessage.includes('Command failed') || errorMessage.includes('Authentication failed')) {
        throw new Error(`Authentication failed. Please check:
1. Enable 2-Factor Authentication in your Gmail account
2. Generate an App Password (not your regular password)
3. Use the App Password in the setup form
4. Ensure IMAP is enabled in Gmail settings`);
      } else if (errorMessage.includes('Connection refused') || errorMessage.includes('ECONNREFUSED')) {
        throw new Error(`Connection failed. Please check:
1. Your internet connection
2. IMAP server settings (imap.gmail.com:993)
3. Firewall/antivirus blocking the connection`);
      } else {
        throw new Error(`Email sync failed: ${errorMessage}`);
      }
    }

    this.currentStatus = { running: false };
    return { status: 'completed' };
  }

  private async computeAnalytics(sender: string, domain: string, message: any, parsed?: ParsedMail) {
    const esp = await this.detectEsp(domain, parsed);

    // Attempt to use Received headers for delivery delta
    const receivedHeaders = (parsed?.headers?.get('received') as any) || [];
    const receivedArray = Array.isArray(receivedHeaders) ? receivedHeaders : receivedHeaders ? [receivedHeaders] : [];
    // Heuristic: last Received is closest to recipient; parse date at end
    const receivedDates = receivedArray
      .map((h: string) => {
        const m = h.match(/;\s*(.+)$/); // date follows last semicolon
        return m ? dayjs(m[1]) : undefined;
      })
      .filter((d) => d && d.isValid()) as dayjs.Dayjs[];

    const sentDate = dayjs(parsed?.date || message.envelope?.date || message.internalDate);
    const receivedDate = receivedDates.length > 0 ? receivedDates[receivedDates.length - 1] : dayjs(message.internalDate);
    const sentToReceivedDeltaMs = receivedDate.diff(sentDate);

    const sendingServer = await this.lookupMx(domain);
    const { openRelay, tlsSupported, tlsValidCert } = await this.checkSmtpSecurity(domain);

    return {
      sender,
      sendingDomain: domain,
      esp,
      sentToReceivedDeltaMs,
      sendingServer,
      openRelay,
      tlsSupported,
      tlsValidCert,
    };
  }

  private async detectEsp(domain: string, parsed?: ParsedMail): Promise<string> {
    const map: Record<string, string> = {
      'gmail.com': 'Gmail/Google Workspace',
      'outlook.com': 'Outlook/Office365',
      'yahoo.com': 'Yahoo',
      'zoho.com': 'Zoho Mail',
      'mailgun.org': 'Mailgun',
      'sendgrid.net': 'SendGrid',
      'amazonses.com': 'Amazon SES',
    };
    if (map[domain]) return map[domain];

    const xMailer = (parsed?.headers?.get('x-mailer') as string) || '';
    if (/sendgrid/i.test(xMailer)) return 'SendGrid';
    if (/ses|amazon/i.test(xMailer)) return 'Amazon SES';

    const received = (parsed?.headers?.get('received') as any) || [];
    const receivedArr = Array.isArray(received) ? received : received ? [received] : [];
    const receivedStr = receivedArr.join(' ');
    if (/sendgrid\.net/i.test(receivedStr)) return 'SendGrid';
    if (/amazonses\.com|ses\.amazonaws\.com/i.test(receivedStr)) return 'Amazon SES';
    if (/mailgun\.org/i.test(receivedStr)) return 'Mailgun';

    return 'Unknown';
  }

  private async lookupMx(domain: string): Promise<string | undefined> {
    try {
      const records = await dns.resolveMx(domain);
      records.sort((a, b) => a.priority - b.priority);
      return records[0]?.exchange;
    } catch {
      return undefined;
    }
  }

  private async checkSmtpSecurity(domain: string): Promise<{ openRelay: boolean; tlsSupported: boolean; tlsValidCert: boolean }> {
    // Placeholder checks: perform DNS MX lookup and assume TLS supported for major providers.
    const mx = await this.lookupMx(domain);
    const tlsSupported = Boolean(mx);
    const tlsValidCert = Boolean(mx);
    const openRelay = false; // For safety, we do not probe open relay here.
    return { openRelay, tlsSupported, tlsValidCert };
  }

  getStatus() {
    return { ...this.currentStatus };
  }
}
