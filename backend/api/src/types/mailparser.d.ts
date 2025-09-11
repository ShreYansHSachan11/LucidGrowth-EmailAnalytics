declare module 'mailparser' {
  export interface ParsedMail {
    text?: string | null;
    html?: string | Buffer | null;
    date?: Date;
    headers?: Map<string, any>;
  }
  export function simpleParser(source: string | Buffer): Promise<ParsedMail>;
}


