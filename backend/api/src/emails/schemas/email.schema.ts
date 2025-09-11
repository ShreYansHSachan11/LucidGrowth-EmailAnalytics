import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailDocument = HydratedDocument<Email>;

@Schema({ timestamps: true, collection: 'emails' })
export class Email {
  @Prop({ required: true, index: true })
  account: string; // email account identifier (e.g., user email)
  @Prop({ required: true, index: true })
  messageId: string;

  @Prop({ required: true })
  folderPath: string;

  @Prop({ type: Number, index: true })
  uid?: number;

  @Prop({ type: Number })
  uidValidity?: number;

  @Prop({ type: [String], index: true })
  from: string[];

  @Prop({ type: [String], index: true })
  to: string[];

  @Prop({ type: [String] })
  cc?: string[];

  @Prop()
  subject?: string;

  @Prop({ type: Date, index: true })
  date?: Date;

  @Prop({ type: Object })
  headers?: Record<string, any>;

  @Prop({ type: Object })
  flags?: {
    seen?: boolean;
    answered?: boolean;
    flagged?: boolean;
    deleted?: boolean;
    draft?: boolean;
  };

  @Prop({ type: Object })
  analytics?: {
    sender?: string;
    sendingDomain?: string;
    esp?: string;
    sentToReceivedDeltaMs?: number;
    sendingServer?: string;
    openRelay?: boolean;
    tlsSupported?: boolean;
    tlsValidCert?: boolean;
  };

  @Prop({ type: String })
  text?: string;

  @Prop({ type: String })
  html?: string;

  @Prop({ type: [String] })
  attachments?: string[];
}

export const EmailSchema = SchemaFactory.createForClass(Email);
// Text index across key fields for full-text search
EmailSchema.index(
  { subject: 'text', text: 'text', html: 'text', from: 'text', to: 'text', 'analytics.sendingDomain': 'text' },
  { weights: { subject: 10, text: 8, html: 2, from: 6, to: 4, 'analytics.sendingDomain': 5 } },
);

// Compound index to enable per-account uniqueness/queries
EmailSchema.index({ account: 1, folderPath: 1, uidValidity: 1, uid: 1 });

