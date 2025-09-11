import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailsModule } from './emails/emails.module';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { ImapModule } from './imap/imap.module';
import { ImapService } from './imap.service';
import { SyncModule } from './sync/sync.module';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lucidgrowth', {
      dbName: process.env.MONGO_DB || 'lucidgrowth',
      serverSelectionTimeoutMS: 5000,
    }),
    EmailsModule,
    ImapModule,
    SyncModule,
    AnalyticsModule,
    SearchModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    EmailsController,
    SyncController,
  ],
  providers: [
    AppService,
    EmailsService,
    ImapService,
    SyncService,
  ],
})
export class AppModule {}
