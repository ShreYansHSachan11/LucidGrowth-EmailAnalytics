import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './emails/schemas/email.schema';

@Injectable()
export class SearchService {
  constructor(@InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>) {}

  async searchEmails(query: string) {
    if (!query) return [];

    const textResults = await this.emailModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(100)
      .lean();

    if (textResults.length > 0) return textResults;

    // Fallback: search sender/to/domain using case-insensitive regex
    const rx = new RegExp(this.escapeRegex(query), 'i');
    return this.emailModel
      .find({ $or: [{ from: rx }, { to: rx }, { 'analytics.sendingDomain': rx }] })
      .limit(100)
      .lean();
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
