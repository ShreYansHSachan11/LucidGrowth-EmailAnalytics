import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './emails/schemas/email.schema';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>) {}

  async getSummary() {
    // Only include the latest 100 emails per account in analytics
    const latestPerAccount = [
      {
        $setWindowFields: {
          partitionBy: '$account',
          sortBy: { date: (-1 as -1) },
          output: { rank: { $rank: {} } },
        },
      },
      { $match: { rank: { $lte: 100 } } },
    ];

    const byEsp = await this.emailModel.aggregate([
      ...latestPerAccount,
      { $group: { _id: '$analytics.esp', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const byDomain = await this.emailModel.aggregate([
      ...latestPerAccount,
      { $group: { _id: '$analytics.sendingDomain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    return { byEsp, byDomain };
  }
}
