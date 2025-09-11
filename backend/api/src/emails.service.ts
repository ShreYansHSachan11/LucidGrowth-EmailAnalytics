import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './emails/schemas/email.schema';

@Injectable()
export class EmailsService {
  constructor(@InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>) {}

  async findAll(limit = 50) {
    return this.emailModel
      .find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }

  async listFolders(account?: string) {
    const match: any = {};
    if (account) match.account = account;
    const results = await this.emailModel.aggregate([
      { $match: match },
      { $group: { _id: '$folderPath', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return results.map((r) => ({ folderPath: r._id as string, count: r.count as number }));
  }

  async findByFolder(folderPath: string, account?: string, limit = 50) {
    const query: any = { folderPath };
    if (account) query.account = account;
    return this.emailModel
      .find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }

  async findById(id: string) {
    return this.emailModel.findById(id).lean();
  }

  async updateFlags(id: string, flags: Partial<NonNullable<Email['flags']>>) {
    const toSet: any = {};
    if (typeof flags.seen === 'boolean') toSet['flags.seen'] = flags.seen;
    if (typeof flags.answered === 'boolean') toSet['flags.answered'] = flags.answered;
    if (typeof flags.flagged === 'boolean') toSet['flags.flagged'] = flags.flagged;
    if (typeof flags.deleted === 'boolean') toSet['flags.deleted'] = flags.deleted;
    if (typeof flags.draft === 'boolean') toSet['flags.draft'] = flags.draft;
    await this.emailModel.updateOne({ _id: id }, { $set: toSet });
    return this.emailModel.findById(id).lean();
  }
}
